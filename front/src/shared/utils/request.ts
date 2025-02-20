export function request<T = unknown>(
  url: string,
  params: RequestInit = {}
): Promise<T> {
  const urlWithLeadingSlash = url[0] === "/" ? url : "/" + url;
  return fetch(
    `${import.meta.env.VITE_API_BASE_URL}${urlWithLeadingSlash}`,
    params
  ).then((res) => {
    if (!res.ok) {
      return res
        .json()
        .then((data) => Promise.reject(data))
        .catch(() => res.text())
        .then((text) => Promise.reject(text));
    }

    return res.json();
  });
}
