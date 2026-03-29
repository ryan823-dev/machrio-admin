package com.machrio.admin.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Static Resource Configuration
 * 
 * Serves frontend static files from /app/static directory (Docker deployment)
 * or from classpath (local development).
 * 
 * Fallback to index.html for SPA routing.
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve static files from /app/static (Docker) or classpath
        registry.addResourceHandler("/**")
                .addResourceLocations("file:/app/static/", "classpath:/static/")
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);
                        
                        // If resource exists, return it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }
                        
                        // Fallback to index.html for SPA routing (only for non-API requests)
                        if (!resourcePath.startsWith("api/")) {
                            Resource indexResource = location.createRelative("index.html");
                            if (indexResource.exists() && indexResource.isReadable()) {
                                return indexResource;
                            }
                        }
                        
                        return null;
                    }
                });
    }
}