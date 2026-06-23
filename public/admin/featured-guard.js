(function () {
  const FEATURED_LABEL = 'Featured Project';
  const TEXT_DECODER = new TextDecoder();
  const TEXT_ENCODER = new TextEncoder();

  let selectedFeaturedIndex = null;

  const decodeBase64 = (value) => {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return TEXT_DECODER.decode(bytes);
  };

  const encodeBase64 = (value) => {
    const bytes = TEXT_ENCODER.encode(value);
    let binary = '';

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  };

  const getElementText = (element) => {
    let current = element;
    let text = '';

    for (let depth = 0; current && depth < 5; depth += 1) {
      text += ` ${current.textContent || ''}`;
      current = current.parentElement;
    }

    return text;
  };

  const isFeaturedCheckbox = (input) => {
    if (!(input instanceof HTMLInputElement) || input.type !== 'checkbox') {
      return false;
    }

    const label = input.id
      ? document.querySelector(`label[for="${CSS.escape(input.id)}"]`)
      : null;

    return (label?.textContent || getElementText(input)).includes(FEATURED_LABEL);
  };

  const trackSelectedFeaturedProject = (event) => {
    const input = event.target;

    if (!isFeaturedCheckbox(input) || !input.checked) {
      return;
    }

    selectedFeaturedIndex = [...document.querySelectorAll('input[type="checkbox"]')]
      .filter(isFeaturedCheckbox)
      .indexOf(input);
  };

  const normalizeProjects = (projects) => {
    const featuredProjects = projects
      .map((project, index) => ({ project, index }))
      .filter(({ project }) => project && project.featured === true);

    if (featuredProjects.length <= 1) {
      return false;
    }

    const trackedProject =
      Number.isInteger(selectedFeaturedIndex) && projects[selectedFeaturedIndex]?.featured === true
        ? projects[selectedFeaturedIndex]
        : null;

    const projectToKeep =
      trackedProject || featuredProjects[featuredProjects.length - 1].project;

    projects.forEach((project) => {
      if (project && project.featured === true && project !== projectToKeep) {
        project.featured = false;
      }
    });

    return true;
  };

  const normalizePayloadBody = async (body) => {
    if (!body || typeof body !== 'string' || !body.includes('"content"')) {
      return body;
    }

    try {
      const payload = JSON.parse(body);

      if (!payload.content || typeof payload.content !== 'string') {
        return body;
      }

      const decodedContent = decodeBase64(payload.content);
      const projects = JSON.parse(decodedContent);

      if (!Array.isArray(projects) || !normalizeProjects(projects)) {
        return body;
      }

      payload.content = encodeBase64(`${JSON.stringify(projects, null, 2)}\n`);

      return JSON.stringify(payload);
    } catch (error) {
      console.warn('Unable to normalize featured project selection.', error);
      return body;
    }
  };

  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, init = {}) => {
    if (typeof init.body === 'string') {
      init = {
        ...init,
        body: await normalizePayloadBody(init.body),
      };
    }

    return nativeFetch(input, init);
  };

  document.addEventListener('change', trackSelectedFeaturedProject, true);
})();
