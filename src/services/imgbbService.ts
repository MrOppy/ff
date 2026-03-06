export const IMGBB_API_KEY = "f4db6d5ad74190b01ffe114b737ff50e";

export const imgbbService = {
    /**
     * Uploads an image file to ImgBB and returns the direct image URL.
     * @param file The image File object to upload
     * @returns The direct URL to the uploaded image
     */
    uploadImage: async (file: File): Promise<string> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                return data.data.url;
            } else {
                console.error("ImgBB Upload Error:", data);
                throw new Error(data.error?.message || "Failed to upload image to ImgBB");
            }
        } catch (error) {
            console.error("Error in imgbbService:", error);
            throw error;
        }
    }
};
