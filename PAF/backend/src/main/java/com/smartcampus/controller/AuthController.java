package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.AuthResponse;
import com.smartcampus.dto.UserDTO;
import com.smartcampus.entity.User;
import com.smartcampus.enums.UserRole;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authentication Controller
 * Module E - Authentication & Authorization
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication APIs")
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String password = request.get("password");

        UserDTO userDTO = UserDTO.builder()
                .email(email)
                .name(name)
                .role(UserRole.USER)
                .build();

        UserDTO createdUser = userService.createUser(userDTO, password);
        
        String token = jwtTokenProvider.generateToken(
                createdUser.getId(), 
                createdUser.getEmail(), 
                createdUser.getRole().name()
        );

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(createdUser)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Registration successful", authResponse));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with email and password")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        if (!user.getActive()) {
            throw new IllegalArgumentException("User account is deactivated");
        }

        String token = jwtTokenProvider.generateToken(
                user.getId(), 
                user.getEmail(), 
                user.getRole().name()
        );

        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .active(user.getActive())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(userDTO)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Login successful", authResponse));
    }

    @PostMapping("/google")
    @Operation(summary = "Login/Register with Google OAuth")
    public ResponseEntity<ApiResponse<AuthResponse>> googleAuth(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String googleId = request.get("googleId");
        String profilePicture = request.get("profilePicture");

        User user = userService.findOrCreateOAuthUser(email, name, googleId, profilePicture);

        String token = jwtTokenProvider.generateToken(
                user.getId(), 
                user.getEmail(), 
                user.getRole().name()
        );

        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .profilePicture(user.getProfilePicture())
                .role(user.getRole())
                .active(user.getActive())
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .user(userDTO)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Google authentication successful", authResponse));
    }
}
