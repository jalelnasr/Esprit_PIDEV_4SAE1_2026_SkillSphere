package org.example.b2bmodule.service.base;

import lombok.extern.slf4j.Slf4j;
import org.example.b2bmodule.exception.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

@Slf4j
@Transactional
public abstract class AbstractCrudService<ENTITY, REQUEST, RESPONSE, ID> 
        implements CrudService<REQUEST, RESPONSE, ID> {

    protected abstract JpaRepository<ENTITY, ID> getRepository();
    protected abstract Function<ENTITY, RESPONSE> getToResponseMapper();
    protected abstract Function<REQUEST, ENTITY> getToEntityMapper();
    protected abstract BiConsumer<ENTITY, REQUEST> getUpdateMapper();
    protected abstract String getResourceName();

    @Override
    public RESPONSE create(REQUEST request) {
        log.info("Creating {}: {}", getResourceName(), request);
        ENTITY entity = getToEntityMapper().apply(request);
        ENTITY saved = getRepository().save(entity);
        log.info("{} created with id: {}", getResourceName(), extractId(saved));
        return getToResponseMapper().apply(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RESPONSE> findAll() {
        log.debug("Finding all {}", getResourceName());
        return getRepository().findAll().stream()
                .map(getToResponseMapper())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RESPONSE> findAll(Pageable pageable) {
        log.debug("Finding all {} with pagination: {}", getResourceName(), pageable);
        return getRepository().findAll(pageable)
                .map(getToResponseMapper());
    }

    @Override
    @Transactional(readOnly = true)
    public RESPONSE findById(ID id) {
        log.debug("Finding {} by id: {}", getResourceName(), id);
        return getRepository().findById(id)
                .map(getToResponseMapper())
                .orElseThrow(() -> new ResourceNotFoundException(getResourceName(), (Long) id));
    }

    @Override
    public RESPONSE update(ID id, REQUEST request) {
        log.info("Updating {} with id: {}", getResourceName(), id);
        ENTITY entity = getRepository().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getResourceName(), (Long) id));
        getUpdateMapper().accept(entity, request);
        ENTITY updated = getRepository().save(entity);
        log.info("{} updated: {}", getResourceName(), id);
        return getToResponseMapper().apply(updated);
    }

    @Override
    public void delete(ID id) {
        log.info("Deleting {} with id: {}", getResourceName(), id);
        if (!getRepository().existsById(id)) {
            throw new ResourceNotFoundException(getResourceName(), (Long) id);
        }
        getRepository().deleteById(id);
        log.info("{} deleted: {}", getResourceName(), id);
    }

    protected ENTITY findEntityById(ID id) {
        return getRepository().findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(getResourceName(), (Long) id));
    }

    private Object extractId(ENTITY entity) {
        try {
            return entity.getClass().getMethod("getId").invoke(entity);
        } catch (Exception e) {
            return "unknown";
        }
    }
}
