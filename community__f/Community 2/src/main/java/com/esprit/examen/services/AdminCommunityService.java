package com.esprit.examen.services;

import com.esprit.examen.dto.AdminActivityItemDTO;
import com.esprit.examen.dto.AdminCommunityStatsDTO;
import com.esprit.examen.dto.AdminPostDetailDTO;
import com.esprit.examen.dto.AdminPostListResponseDTO;

import java.util.List;

public interface AdminCommunityService {
    AdminCommunityStatsDTO getStats();
    List<AdminActivityItemDTO> getRecentActivities(int limit);
    AdminPostListResponseDTO getPosts(int page, int size);
    AdminPostDetailDTO getPostDetail(Long postId);
}
