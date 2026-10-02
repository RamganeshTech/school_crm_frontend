import { useQuery } from "@tanstack/react-query";
// import { Api } from "../../lib/api";

// --- Types ---
export interface ILatestRelease {
    version: string;
    windowsUrl: string;
    releasedAt: string;
}

export interface BaseResponse<T> {
    ok: boolean;
    message?: string;
    data: T;
}

// --- Hook: Get Latest Desktop App Release Info ---
export const useGetLatestRelease = () => {
    return useQuery({
        queryKey: ['downloads-latest-release'],
        queryFn: async () => {
            // try {
            //     const { data } = await Api.get<BaseResponse<ILatestRelease>>(`/api/downloads/latest`);

            //     if (data.ok) {
            //         return data.data;
            //     } else {
            //         throw new Error(data.message || 'Failed to fetch latest release info');
            //     }
            // } catch (error: any) {
            //     const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
            //     throw new Error(errorMessage, { cause: error });
            // }

            return {
                // windowsUrl: "https://bmb-jaihind-images.s3.ap-south-1.amazonaws.com/installers/daily-grades-offline-1.0.0-setup.exe",
                windowsUrl: "https://bmb-jaihind-images.s3.ap-south-1.amazonaws.com/installers/daily-grades-offline-1.0.0-setup.exe",
                version: "1.0.0",
                releasedAt: "2026-09-23",
            };
        },
    });
};