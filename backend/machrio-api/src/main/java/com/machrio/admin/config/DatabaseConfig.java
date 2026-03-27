package com.machrio.admin.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import com.zaxxer.hikari.HikariDataSource;

/**
 * Database configuration to handle Railway DATABASE_URL format
 * Converts postgresql:// to jdbc:postgresql:// automatically
 */
@Configuration
@EnableConfigurationProperties
public class DatabaseConfig {

    @Value("${DATABASE_URL:}")
    private String databaseUrl;

    @Value("${DATABASE_USERNAME:postgres}")
    private String username;

    @Value("${DATABASE_PASSWORD:postgres}")
    private String password;

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public DataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        
        // Convert DATABASE_URL to JDBC URL if present
        if (databaseUrl != null && !databaseUrl.isEmpty() && databaseUrl.startsWith("postgresql://")) {
            String jdbcUrl = "jdbc:" + databaseUrl;
            dataSource.setJdbcUrl(jdbcUrl);
            dataSource.setUsername(username);
            dataSource.setPassword(password);
        } else if (databaseUrl != null && !databaseUrl.isEmpty()) {
            // Already in JDBC format or other format
            dataSource.setJdbcUrl(databaseUrl);
            dataSource.setUsername(username);
            dataSource.setPassword(password);
        }
        // If no databaseUrl, let Spring Boot use default configuration
        
        return dataSource;
    }
}
