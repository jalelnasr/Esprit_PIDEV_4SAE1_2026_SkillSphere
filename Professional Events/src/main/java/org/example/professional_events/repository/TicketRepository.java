package org.example.professional_events.repository;

import org.example.professional_events.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByCompetitionId(Long competitionId);
    List<Ticket> findByType(Ticket.TicketType type);
}

