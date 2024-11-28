declare module "cloudinary" {
    export namespace v2 {
        interface ConfigOptions {
            cloud_name: string;
            api_key: string;
            api_secret: string;
        }

        interface UploadApiResponse {
            asset_id: string;
            public_id: string;
            version: number;
            version_id: string;
            signature: string;
            width: number;
            height: number;
            format: string;
            resource_type: string;
            created_at: string;
            tags: string[];
            bytes: number;
            type: string;
            etag: string;
            placeholder: boolean;
            url: string;
            secure_url: string;
            folder: string;
        }

        interface UploadStream {
            end(buffer: Buffer): void;
        }

        interface Uploader {
            upload(
                file: string,
                options?: Record<string, any>
            ): Promise<UploadApiResponse>;
            upload_stream(
                options: Record<string, any>,
                callback: (error: Error | null, result?: UploadApiResponse) => void
            ): UploadStream;
        }

        const uploader: Uploader;

        function config(options: ConfigOptions): void;
    }
}
