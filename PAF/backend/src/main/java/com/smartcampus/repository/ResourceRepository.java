package com.smartcampus.repository;

import com.smartcampus.entity.Resource;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByStatus(ResourceStatus status);
    List<Resource> findByLocation(String location);
    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
    
    @Query("SELECT r FROM Resource r WHERE " +
           "(:type IS NULL OR r.type = :type) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:location IS NULL OR r.location LIKE %:location%) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity)")
    List<Resource> searchResources(
            @Param("type") ResourceType type,
            @Param("status") ResourceStatus status,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity);
    
    List<Resource> findByNameContainingIgnoreCase(String name);
}
