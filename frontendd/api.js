const BASE_URL = "http://localhost:5000/api";

export const getSummary = async (user) => {
  const res = await fetch(`${BASE_URL}/dashboard`, {
    headers: { user: JSON.stringify(user) }
  });
  return res.json();
};