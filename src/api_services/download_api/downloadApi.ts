import axios from "axios";
import { toast } from "../../shared/ui/ToastContext"; // Adjust path to match your custom toast layout

interface DownloadImageParams {
    fileKey: string;
    // originalName?: string;
}

export const downloadImageUtil = async ({ fileKey }: DownloadImageParams) => {
    try {
        if (!fileKey) {
            toast.error("File key asset missing reference.");
            return;
        }
        // Hit your newly registered download route
        const { data } = await axios.get(`${import.meta.env.VITE_APP_BASE_API}/api/download`, {
            params: { key: fileKey }
        });

        if (!data?.url) {
            throw new Error("No download URL returned from backend server.");
        }

    //    // Programmatically initialize browser file attachment streams
    //     const link = document.createElement("a");
    //     link.href = data.url;
    //     // link.target = "_blank"; // Secure tab download fallback
    //     link.download = originalName || "download";
        
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);


        // 🌟 Safe Background Download Trigger
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        iframe.src = data.url;
        document.body.appendChild(iframe);
        
        // Automatic cleanup after the browser grabs the stream data
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 5000);

        toast.success("Download started successfully.");
    } catch (error: any) {
        const errorMsg = error?.response?.data?.message || "Failed to complete download request.";
        toast.error(errorMsg);
    }
};