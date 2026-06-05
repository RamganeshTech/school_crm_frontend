// import { useMutation } from '@tanstack/react-query';
// import axios from 'axios';
// import { toast } from '../../shared/ui/ToastContext'; // Adjust path based on your setup

// interface DownloadResponse {
//     url: string;
//     message?: string;
// }

// interface DownloadParams {
//     fileKey: string;
//     originalName?: string;
// }

// export const useDownloadFile = () => {
//     return useMutation({
//         mutationFn: async ({ fileKey }: DownloadParams): Promise<DownloadResponse> => {
//             // Adjust the URL prefix if your Axios instance has an existing base configuration
//             const response = await axios.get<DownloadResponse>(`${import.meta.env.VITE_APP_BASE_API}/api/download`, {
//                 params: { key: fileKey }
//             });
//             return response.data;
//         },
//         onSuccess: (data, variables) => {
//             if (!data.url) {
//                 toast.error("Download URL could not be generated.");
//                 return;
//             }

//             try {
//                 // Programmatically trigger browser attachment transfer download channel
//                 const link = document.createElement('a');
//                 link.href = data.url;
//                 // link.target = '_blank';
//                 // Use fallback if original file name parameter string is absent
//                 link.download = variables.originalName || 'downloaded-file';
                
//                 document.body.appendChild(link);
//                 link.click();
//                 document.body.removeChild(link);

//                 toast.success("Download started successfully.");
//             } catch (err) {
//                 console.error("Browser download execution failed:", err);
//                 toast.error("Failed to initialize file transfer sequence.");
//             }
//         },
//         onError: (error: any) => {
//             console.error("API Download structural error logs:", error);
//             const errorMsg = error.response?.data?.message || "Error reaching server download endpoint.";
//             toast.error(errorMsg);
//         }
//     });
// };




import axios from "axios";
import { toast } from "../../shared/ui/ToastContext"; // Adjust path to match your custom toast layout

interface DownloadImageParams {
    fileKey: string;
    originalName?: string;
}

export const downloadImageUtil = async ({ fileKey, originalName }: DownloadImageParams) => {
    try {
        if (!fileKey) {
            toast.error("File key asset missing reference.");
            return;
        }

        console.log("originalName", originalName)

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
        console.error("Standalone helper execution exception:", error);
        const errorMsg = error?.response?.data?.message || "Failed to complete download request.";
        toast.error(errorMsg);
    }
};