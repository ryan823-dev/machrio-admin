package com.machrio.admin.service;

import com.aliyun.oss.OSS;
import com.aliyun.oss.model.*;
import com.machrio.admin.config.OssConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class OssService {

    private final OSS ossClient;
    private final OssConfig ossConfig;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    /**
     * 上传图片文件
     * @param file 上传的文件
     * @param folder 文件夹路径，如 "products", "categories", "industries"
     * @return 图片访问 URL
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        // 验证文件类型
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("不支持的文件类型：" + contentType);
        }

        // 验证文件大小
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("文件大小不能超过 10MB");
        }

        // 生成文件名
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String filename = UUID.randomUUID().toString().replace("-", "") + extension;

        // 生成 OSS 路径
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String objectKey = String.format("%s/%s/%s", folder, datePath, filename);

        try (InputStream inputStream = file.getInputStream()) {
            // 上传到 OSS
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    ossConfig.getBucket(),
                    objectKey,
                    inputStream
            );
            
            // 设置元数据
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType(contentType);
            metadata.setCacheControl("public, max-age=31536000"); // 缓存 1 年
            putObjectRequest.setMetadata(metadata);

            ossClient.putObject(putObjectRequest);

            // 返回访问 URL
            return getImageUrl(objectKey);
        } catch (Exception e) {
            log.error("上传文件到 OSS 失败：{}", e.getMessage(), e);
            throw new IOException("上传文件失败", e);
        }
    }

    /**
     * 从字节数组上传图片
     */
    public String uploadImage(byte[] data, String filename, String folder) throws IOException {
        String extension = filename.contains(".") ? filename.substring(filename.lastIndexOf(".")) : ".jpg";
        String objectKey = generateObjectKey(folder, extension);

        try (InputStream inputStream = new ByteArrayInputStream(data)) {
            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    ossConfig.getBucket(),
                    objectKey,
                    inputStream
            );
            
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentType("image/jpeg");
            metadata.setCacheControl("public, max-age=31536000");
            putObjectRequest.setMetadata(metadata);

            ossClient.putObject(putObjectRequest);
            return getImageUrl(objectKey);
        }
    }

    /**
     * 删除图片
     */
    public void deleteImage(String imageUrl) {
        try {
            String objectKey = extractObjectKey(imageUrl);
            if (objectKey != null) {
                ossClient.deleteObject(ossConfig.getBucket(), objectKey);
                log.info("删除 OSS 文件：{}", objectKey);
            }
        } catch (Exception e) {
            log.error("删除 OSS 文件失败：{}", e.getMessage(), e);
        }
    }

    /**
     * 批量删除图片
     */
    public void deleteImages(List<String> imageUrls) {
        for (String url : imageUrls) {
            deleteImage(url);
        }
    }

    /**
     * 获取图片访问 URL
     */
    private String getImageUrl(String objectKey) {
        // 生成签名 URL（有效期 1 年）
        // 如果 bucket 是公共读，也可以直接拼接 URL
        return String.format("https://%s.%s/%s", 
                ossConfig.getBucket(),
                ossConfig.getEndpoint().replace("https://", ""),
                objectKey);
    }

    /**
     * 生成 OSS 对象键
     */
    private String generateObjectKey(String folder, String extension) {
        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String filename = UUID.randomUUID().toString().replace("-", "") + extension;
        return String.format("%s/%s/%s", folder, datePath, filename);
    }

    /**
     * 从 URL 提取 objectKey
     */
    private String extractObjectKey(String imageUrl) {
        try {
            String prefix = String.format("https://%s.%s/", 
                    ossConfig.getBucket(),
                    ossConfig.getEndpoint().replace("https://", ""));
            if (imageUrl.startsWith(prefix)) {
                return imageUrl.substring(prefix.length());
            }
        } catch (Exception e) {
            log.warn("无法解析 OSS URL: {}", imageUrl);
        }
        return null;
    }

    /**
     * 检查文件是否存在
     */
    public boolean doesObjectExist(String objectKey) {
        return ossClient.doesObjectExist(ossConfig.getBucket(), objectKey);
    }
}
