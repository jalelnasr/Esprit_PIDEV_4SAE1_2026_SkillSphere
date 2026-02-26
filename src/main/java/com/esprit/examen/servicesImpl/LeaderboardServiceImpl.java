package com.esprit.examen.servicesImpl;

import com.esprit.examen.dto.LeaderboardEntry;
import com.esprit.examen.entities.User;
import com.esprit.examen.exceptions.ResourceNotFoundException;
import com.esprit.examen.repositories.UserProgressRepository;
import com.esprit.examen.repositories.UserRepository;
import com.esprit.examen.services.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final UserRepository userRepository;
    private final UserProgressRepository userProgressRepository;

    @Override
    public List<LeaderboardEntry> getGlobalLeaderboard() {
        List<User> users = userRepository.findAll();
        return buildLeaderboard(users);
    }

    @Override
    public List<LeaderboardEntry> getTopN(int n) {
        List<LeaderboardEntry> full = getGlobalLeaderboard();
        return full.stream().limit(n).toList();
    }

    @Override
    public List<LeaderboardEntry> getLeaderboardByRank(String rank) {
        List<User> users = userRepository.findAll().stream()
                .filter(u -> rank.equalsIgnoreCase(u.getRank()))
                .toList();
        return buildLeaderboard(users);
    }

    @Override
    public LeaderboardEntry getUserPosition(Long userId) {
        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<LeaderboardEntry> full = getGlobalLeaderboard();
        return full.stream()
                .filter(e -> e.idUser().equals(target.getIdUser()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("User not found in leaderboard"));
    }

    private List<LeaderboardEntry> buildLeaderboard(List<User> users) {
        List<User> sorted = users.stream()
                .sorted(Comparator
                        .comparingInt((User u) -> u.getTotalPoints() != null ? u.getTotalPoints() : 0)
                        .reversed()
                        .thenComparingInt(u -> u.getLevel() != null ? u.getLevel() : 0)
                        .reversed())
                .toList();

        List<LeaderboardEntry> leaderboard = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            User u = sorted.get(i);
            long completed = userProgressRepository.findByUserIdUserAndCompletedTrue(u.getIdUser()).size();
            long badges = u.getBadges() != null ? u.getBadges().size() : 0;

            leaderboard.add(new LeaderboardEntry(
                    (long) (i + 1),
                    u.getIdUser(),
                    u.getNom(),
                    u.getPrenom(),
                    u.getTotalPoints(),
                    u.getLevel(),
                    u.getRank(),
                    completed,
                    badges
            ));
        }
        return leaderboard;
    }
}
