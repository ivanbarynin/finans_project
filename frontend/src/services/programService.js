import api from './api';

export const programService = {
  getAll: (hasChildren, isIT, region, isYoungFamily, isSVOParticipant, isMultiChild, isAPKWorker) => {
    const params = {};
    if (hasChildren !== undefined) params.has_children = hasChildren;
    if (isIT !== undefined) params.is_it = isIT;
    if (region !== undefined) params.region = region;
    if (isYoungFamily !== undefined) params.is_young_family = isYoungFamily;
    if (isSVOParticipant !== undefined) params.is_svo_participant = isSVOParticipant;
    if (isMultiChild !== undefined) params.is_multi_child = isMultiChild;
    if (isAPKWorker !== undefined) params.is_apk_worker = isAPKWorker;

    return api.get('/programs', { params });
  },
};
