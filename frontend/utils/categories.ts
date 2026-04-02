export const CATEGORIES = [
  { id: 1, name: 'Tecnología y Programación', icon: 'laptop' },
  { id: 2, name: 'Ciencia y Matemáticas', icon: 'flask' },
  { id: 3, name: 'Educación y Aprendizaje', icon: 'book' },
  { id: 4, name: 'Salud y Bienestar', icon: 'heart' },
  { id: 5, name: 'Arte y Cultura', icon: 'palette' },
  { id: 6, name: 'Negocios y Emprendimiento', icon: 'briefcase' },
  { id: 7, name: 'Viajes y Geografía', icon: 'airplane' },
  { id: 8, name: 'Idiomas', icon: 'language' },
  { id: 9, name: 'Deportes y Fitness', icon: 'fitness' },
  { id: 10, name: 'Vida Cotidiana', icon: 'home' },
];

export const getCategoryIcon = (categoryName: string): string => {
  const category = CATEGORIES.find(c => c.name === categoryName);
  return category?.icon || 'help-circle';
};
