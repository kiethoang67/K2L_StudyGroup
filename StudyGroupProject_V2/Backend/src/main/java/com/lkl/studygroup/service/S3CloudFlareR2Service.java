package com.lkl.studygroup.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.time.Duration;

@Service
    public class S3CloudFlareR2Service {

        @Value("${cloudflare.r2.bucket-name}")
        private String bucket;

        @Value("${cloudflare.r2.public-url}")
        private String publicUrl;

        private final S3Presigner presigner;

        public S3CloudFlareR2Service(S3Presigner presigner) {
            this.presigner = presigner;
        }

        public String generateUploadUrl(String folder, String fileName, String contentType) {

            String key = folder + "/" + fileName;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            PutObjectPresignRequest presignRequest =
                    PutObjectPresignRequest.builder()
                            .signatureDuration(Duration.ofMinutes(10))
                            .putObjectRequest(putObjectRequest)
                            .build();

            return presigner.presignPutObject(presignRequest)
                    .url()
                    .toString();
        }

    public String buildPublicUrl(String folder, String fileName) {
        return publicUrl + "/" + folder + "/" + fileName;
    }
}
