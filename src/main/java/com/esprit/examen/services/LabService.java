package com.esprit.examen.services;

import com.esprit.examen.entities.Lab;

import java.util.List;

public interface LabService {

    Lab createLab(Lab lab, Long categoryId);

    Lab getLabById(Long id);

    List<Lab> getAllLabs();

    List<Lab> getLabsByCategory(Long categoryId);

    List<Lab> getLabsByDifficulty(String difficulty);

    List<Lab> getActiveLabs();

    List<Lab> getLabsForUserLevel(Integer level);

    Lab updateLab(Long id, Lab lab);

    void deleteLab(Long id);
}