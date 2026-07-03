const TRANSITIONS = {
  CREATED: ['ASSIGNED'],
  ASSIGNED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  FAILED: ['RESCHEDULED'],
  RESCHEDULED: ['ASSIGNED'],
};

function canTransition(from, to) {
  return TRANSITIONS[from]?.includes(to);
}

module.exports = {
  canTransition,
  TRANSITIONS,
};
