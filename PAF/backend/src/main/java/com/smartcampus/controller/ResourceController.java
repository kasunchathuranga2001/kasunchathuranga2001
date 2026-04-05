package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for Resource Management
 * Module A - Facilities & Assets Catalogue
 */
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Facilities & Assets Catalogue Management")
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    @Operation(summary = "Get all resources")
    public ResponseEntity<ApiResponse<List<ResourceDTO>>> getAllResources() {
        List<ResourceDTO> resources = resourceService.getAllResources();
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID")
    public ResponseEntity<ApiResponse<ResourceDTO>> getResourceById(@PathVariable Long id) {
        ResourceDTO resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success(resource));
    }

    @GetMapping("/search")
    @Operation(summary = "Search and filter resources")
    public ResponseEntity<ApiResponse<List<ResourceDTO>>> searchResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {
        List<ResourceDTO> resources = resourceService.searchResources(type, status, location, minCapacity);
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @GetMapping("/type/{type}")
    @Operation(summary = "Get resources by type")
    public ResponseEntity<ApiResponse<List<ResourceDTO>>> getResourcesByType(@PathVariable ResourceType type) {
        List<ResourceDTO> resources = resourceService.getResourcesByType(type);
        return ResponseEntity.ok(ApiResponse.success(resources));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new resource (Admin only)")
    public ResponseEntity<ApiResponse<ResourceDTO>> createResource(@Valid @RequestBody ResourceDTO dto) {
        ResourceDTO resource = resourceService.createResource(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Resource created successfully", resource));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a resource (Admin only)")
    public ResponseEntity<ApiResponse<ResourceDTO>> updateResource(
            @PathVariable Long id, 
            @Valid @RequestBody ResourceDTO dto) {
        ResourceDTO resource = resourceService.updateResource(id, dto);
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", resource));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update resource status (Admin only)")
    public ResponseEntity<ApiResponse<ResourceDTO>> updateResourceStatus(
            @PathVariable Long id, 
            @RequestParam ResourceStatus status) {
        ResourceDTO resource = resourceService.updateResourceStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Resource status updated", resource));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a resource (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully", null));
    }
}
