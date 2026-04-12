package com.esprit.examen.services;

import com.esprit.examen.dto.SuggestedGroupDTO;
import com.esprit.examen.dto.SuggestedUserDTO;

import java.util.List;

public interface SuggestionService {
    List<SuggestedUserDTO> suggestUsersForCurrentUser();
    List<SuggestedGroupDTO> suggestGroupsForCurrentUser();
}
