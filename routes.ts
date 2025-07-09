import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import sharp from "sharp";
import { storage } from "./storage";
import { gifSettingsSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Upload multiple images
  app.post("/api/upload", (req: any, res: any, next: any) => {
    upload.array('images', 50)(req, res, (err: any) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'File upload error: ' + err.message });
      }
      next();
    });
  }, async (req: any, res) => {
    try {
      console.log("Upload request received");
      console.log("Files:", req.files);
      console.log("Body:", req.body);
      
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        console.log("No files uploaded - req.files:", req.files);
        return res.status(400).json({ message: "No files uploaded" });
      }

      const processedImages = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filename = `${Date.now()}-${i}.png`;
        const filepath = path.join(uploadsDir, filename);
        
        // Process image with sharp
        await sharp(file.buffer)
          .resize(800, 600, { fit: 'inside', withoutEnlargement: true })
          .png()
          .toFile(filepath);
          
        processedImages.push({
          filename,
          originalName: file.originalname,
          size: file.size,
        });
      }

      res.json({ 
        message: "Images uploaded successfully",
        images: processedImages
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Failed to upload images" });
    }
  });

  // Generate GIF from uploaded images
  app.post("/api/generate-gif", async (req, res) => {
    try {
      const { images, settings } = req.body;
      
      if (!images || !Array.isArray(images) || images.length === 0) {
        return res.status(400).json({ message: "No images provided" });
      }

      // Validate settings
      const validatedSettings = gifSettingsSchema.parse(settings);
      
      // Create GIF job
      const job = await storage.createGifJob({
        filename: `gif-${Date.now()}.gif`,
        settings: JSON.stringify(validatedSettings),
        status: "processing"
      });

      // Process GIF creation in background
      processGifCreation(job.id, images, validatedSettings);

      res.json({
        message: "GIF generation started",
        jobId: job.id
      });
    } catch (error) {
      console.error("GIF generation error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid settings", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to start GIF generation" });
    }
  });

  // Check GIF job status
  app.get("/api/gif-job/:id", async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      const job = await storage.getGifJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      res.json({
        id: job.id,
        status: job.status,
        filename: job.filename,
        settings: JSON.parse(job.settings)
      });
    } catch (error) {
      console.error("Job status error:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  // Download generated GIF
  app.get("/api/download/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // Set proper headers for GIF files
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      // Stream the file
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Download error:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Preview generated GIF (for browser display)
  app.get("/api/preview/:filename", (req, res) => {
    try {
      const filename = req.params.filename;
      const filepath = path.join(uploadsDir, filename);
      
      if (!fs.existsSync(filepath)) {
        return res.status(404).json({ message: "File not found" });
      }

      // Set proper headers for GIF preview
      res.setHeader('Content-Type', 'image/gif');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      
      // Stream the file
      const fileStream = fs.createReadStream(filepath);
      fileStream.pipe(res);
    } catch (error) {
      console.error("Preview error:", error);
      res.status(500).json({ message: "Failed to preview file" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background GIF processing function
async function processGifCreation(jobId: number, images: string[], settings: any) {
  try {
    // Import GIF encoder
    const GIFEncoder = (await import('gif-encoder-2')).default;
    
    const width = settings.width || 600;
    const height = settings.height || 600;
    const outputPath = path.join(uploadsDir, `gif-${jobId}.gif`);
    
    // Create GIF encoder with transparent background
    const encoder = new GIFEncoder(width, height);
    encoder.setRepeat(settings.loop);
    encoder.setDelay(Math.floor(1000 / 60)); // 60 FPS - approximately 16ms per frame
    encoder.setQuality(10); // High quality for smooth animation
    encoder.setTransparent(true); // Enable transparency
    
    // Start encoding
    encoder.start();
    encoder.createReadStream().pipe(fs.createWriteStream(outputPath));

    // Process images to create sliding animation
    const processedImages = [];
    for (const imageName of images) {
      const imagePath = path.join(uploadsDir, imageName);
      
      if (fs.existsSync(imagePath)) {
        // Process image with sharp to get RGBA buffer with transparent background
        const imageBuffer = await sharp(imagePath)
          .resize(width, height, { 
            fit: 'cover', 
            background: { r: 0, g: 0, b: 0, alpha: 0 } 
          })
          .png({ compressionLevel: 0 }) // No compression for better quality
          .ensureAlpha()
          .raw()
          .toBuffer();
        
        processedImages.push(imageBuffer);
      }
    }

    // Create sliding animation frames for 60 FPS
    const framesPerTransition = 15; // More frames for 60 FPS smooth sliding
    
    for (let i = 0; i < processedImages.length; i++) {
      const currentImage = processedImages[i];
      const nextImage = processedImages[(i + 1) % processedImages.length];
      
      // Add current image frame
      encoder.addFrame(currentImage);
      
      // Create transition frames (sliding effect - top to bottom)
      for (let j = 1; j <= framesPerTransition; j++) {
        const progress = j / framesPerTransition;
        const transitionFrame = Buffer.alloc(width * height * 4);
        
        // Fill with fully transparent background
        transitionFrame.fill(0);
        
        // Create vertical sliding effect - next image slides down from top
        const slideOffset = Math.floor(progress * height);
        
        for (let row = 0; row < height; row++) {
          for (let col = 0; col < width; col++) {
            const pixelIndex = row * width + col;
            const baseIndex = pixelIndex * 4;
            
            // Next image appears from top and slides down
            if (row < slideOffset) {
              const sourceIndex = ((row + height - slideOffset) * width + col) * 4;
              transitionFrame[baseIndex] = nextImage[sourceIndex];
              transitionFrame[baseIndex + 1] = nextImage[sourceIndex + 1];
              transitionFrame[baseIndex + 2] = nextImage[sourceIndex + 2];
              transitionFrame[baseIndex + 3] = nextImage[sourceIndex + 3];
            } else {
              // Current image remains in lower portion
              const adjustedRow = row - slideOffset;
              if (adjustedRow < height) {
                const sourceIndex = (adjustedRow * width + col) * 4;
                transitionFrame[baseIndex] = currentImage[sourceIndex];
                transitionFrame[baseIndex + 1] = currentImage[sourceIndex + 1];
                transitionFrame[baseIndex + 2] = currentImage[sourceIndex + 2];
                transitionFrame[baseIndex + 3] = currentImage[sourceIndex + 3];
              }
            }
          }
        }
        
        encoder.addFrame(transitionFrame);
      }
    }

    encoder.finish();
    
    // Update job status
    await storage.updateGifJobStatus(jobId, "completed");
    
    // Clean up individual images
    for (const imageName of images) {
      const imagePath = path.join(uploadsDir, imageName);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  } catch (error) {
    console.error("GIF processing error:", error);
    await storage.updateGifJobStatus(jobId, "failed");
  }
}
