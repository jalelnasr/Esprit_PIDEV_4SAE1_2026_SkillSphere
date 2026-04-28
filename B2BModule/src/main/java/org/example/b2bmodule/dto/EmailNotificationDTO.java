package org.example.b2bmodule.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailNotificationDTO {
    private String candidateEmail;
    private String candidateName;
    private String jobTitle;
    private String companyName;
    private String status; // ACCEPTED or REJECTED
    private String message; // Message personnalisé du RH (optionnel)
}
