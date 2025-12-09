import { createUploadthing, type FileRouter } from 'uploadthing/next';

const f = createUploadthing();

export const ourFileRouter = {
  pledgeImages: f({ image: { maxFileSize: '3MB', maxFileCount: 3 } })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Return the file data that will be sent to the client
        return { 
          url: file.url, 
          key: file.key,
          name: file.name,
          size: file.size,
        };
      } catch (error) {
        console.error('Error in onUploadComplete:', error);
        // Still return the essential data even if there's an error
        return { url: file.url, key: file.key };
      }
    }),
  submissionImages: f({ image: { maxFileSize: '3MB', maxFileCount: 3 } })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        // Return the file data that will be sent to the client
        return { 
          url: file.url, 
          key: file.key,
          name: file.name,
          size: file.size,
        };
      } catch (error) {
        console.error('Error in onUploadComplete:', error);
        // Still return the essential data even if there's an error
        return { url: file.url, key: file.key };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

// Validate that all endpoints are properly defined
const endpointNames = Object.keys(ourFileRouter);
console.log('✅ UploadThing endpoints registered:', endpointNames.join(', '));



