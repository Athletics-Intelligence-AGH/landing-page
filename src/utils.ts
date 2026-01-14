const canBeDisplayed = (draft: boolean, publishDate: Date): boolean => {
  return !draft && publishDate < new Date();
};

export { canBeDisplayed };
