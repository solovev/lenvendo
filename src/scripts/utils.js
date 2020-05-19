export const encodeHTML = (value) =>
value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');