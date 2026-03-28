package com.machrio.admin.controller;

import com.machrio.admin.dto.ApiResponse;
import com.machrio.admin.service.OssService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UploadController {

    private final OssService ossService;

    /**
     * 通用图片上传接口
     * @param file 上传的文件
     * @param folder 文件夹：products, categories, industries, articles, brands
     * @return 图片 URL
     */
    @PostMapping("/image")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "uploads") String folder) {
        
        try {
            String imageUrl = ossService.uploadImage(file, folder);
            
            Map<String, String> result = new HashMap<>();
            result.put("url", imageUrl);
            result.put("filename", file.getOriginalFilename());
            result.put("size", String.valueOf(file.getSize()));
            
            return ResponseEntity.ok(ApiResponse.success(result, "上传成功"));
        } catch (IOException e) {
            log.error("上传失败：{}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error(null, "上传失败：" + e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(null, e.getMessage()));
        }
    }

    /**
     * 删除图片
     */
    @DeleteMapping("/image")
    public ResponseEntity<ApiResponse<Void>> deleteImage(@RequestParam("url") String imageUrl) {
        try {
            ossService.deleteImage(imageUrl);
            return ResponseEntity.ok(ApiResponse.success(null, "删除成功"));
        } catch (Exception e) {
            log.error("删除失败：{}", e.getMessage(), e);
            return ResponseEntity.badRequest().body(ApiResponse.error(null, "删除失败：" + e.getMessage()));
        }
    }
}
