// Format time in human-readable format
export const formatTime = (minutes: number) => {
  if (!minutes) return '0 min';
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) return `${hours} hr`;
  return `${hours} hr ${mins} min`;
};

export const formatServingSize = (servings: number) => {
  if (!servings) return '1';
  return `${servings}`;
};

export const formatServingLabel = (servings: number) => {
  if (!servings || servings === 1) {
    return 'Serve';
  }
  return 'Serves';
};
