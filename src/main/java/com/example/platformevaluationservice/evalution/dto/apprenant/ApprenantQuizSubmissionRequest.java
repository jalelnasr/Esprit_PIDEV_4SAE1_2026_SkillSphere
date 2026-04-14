package com.example.platformevaluationservice.evalution.dto.apprenant;

import java.util.List;

public class ApprenantQuizSubmissionRequest {

    private List<AnswerItem> answers;

    public List<AnswerItem> getAnswers() {
        return answers;
    }

    public void setAnswers(List<AnswerItem> answers) {
        this.answers = answers;
    }

    public static class AnswerItem {
        private Long questionId;
        private Long choiceId;

        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public Long getChoiceId() {
            return choiceId;
        }

        public void setChoiceId(Long choiceId) {
            this.choiceId = choiceId;
        }
    }
}
