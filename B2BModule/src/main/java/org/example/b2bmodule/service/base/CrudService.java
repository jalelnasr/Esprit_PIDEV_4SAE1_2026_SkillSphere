package org.example.b2bmodule.service.base;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CrudService<REQUEST, RESPONSE, ID> {
    RESPONSE create(REQUEST request);
    List<RESPONSE> findAll();
    Page<RESPONSE> findAll(Pageable pageable);
    RESPONSE findById(ID id);
    RESPONSE update(ID id, REQUEST request);
    void delete(ID id);
}
