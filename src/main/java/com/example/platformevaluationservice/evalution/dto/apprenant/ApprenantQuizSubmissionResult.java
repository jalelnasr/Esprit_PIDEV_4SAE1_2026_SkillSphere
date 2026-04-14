package com.example.platformevaluationservice.evalution.dto.apprenant;

public class ApprenantQuizSubmissionResult {

    private Long quizId;
    private Integer score;
    private Integer currentAttemptScore;
    private Integer passingScore;
    private Boolean passed;
    private Boolean improved;
    private Boolean alreadyPassed;

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getCurrentAttemptScore() {
        return currentAttemptScore;
    }

    public void setCurrentAttemptScore(Integer currentAttemptScore) {
        this.currentAttemptScore = currentAttemptScore;
    }

    public Integer getPassingScore() {
        return passingScore;
    }

    public void setPassingScore(Integer passingScore) {
        this.passingScore = passingScore;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public Boolean getImproved() {
        return improved;
    }

    public void setImproved(Boolean improved) {
        this.improved = improved;
    }

    public Boolean getAlreadyPassed() {
        return alreadyPassed;
    }

    public void setAlreadyPassed(Boolean alreadyPassed) {
        this.alreadyPassed = alreadyPassed;
    }
}
