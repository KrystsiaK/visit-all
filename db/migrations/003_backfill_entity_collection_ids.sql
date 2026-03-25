UPDATE traces t
SET collection_id = ec.collection_id
FROM entity_containers ec
WHERE t.container_id = ec.id
  AND t.collection_id IS NULL
  AND ec.collection_id IS NOT NULL;

UPDATE areas a
SET collection_id = ec.collection_id
FROM entity_containers ec
WHERE a.container_id = ec.id
  AND a.collection_id IS NULL
  AND ec.collection_id IS NOT NULL;

UPDATE pins p
SET collection_id = ec.collection_id
FROM entity_containers ec
WHERE p.container_id = ec.id
  AND p.collection_id IS NULL
  AND ec.collection_id IS NOT NULL;
