import axios from 'axios';

const API_KEY = '36750507-21f23312de1f08bfaa38e5a02';

export class PixabayApiImages {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.totalPages = 0;
    this.totalHits = 0;
    this.perPage = 40;
  }

  async getImages() {
    const BASE_URL = `https://pixabay.com/api/?key=${API_KEY}&image_type=photo&orientation=horizontal&safesearch=true&q=${this.searchQuery}&per_page=${this.perPage}&page=${this.page}`;
    const images = await axios.get(BASE_URL);

    const data = images.data.hits;
    this.incrementPage(data);
    this.totalHitsResponse(images.data.totalHits);
    return data;
  }

  incrementPage(data) {
    if (data) {
      this.page += 1;
    }
  }

  totalHitsResponse(value) {
    this.totalHits = value;
  }

  hasMoreImages() {
    return this.page < this.totalPages;
  }

  resetPage() {
    this.page = 1;
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }
}
