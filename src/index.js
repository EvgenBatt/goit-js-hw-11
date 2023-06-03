import Notiflix from 'notiflix';
import { cardTemplate } from './js/card-template';
import { PixabayApiImages } from './js/pixabay-api';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryList: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

const pixabayImages = new PixabayApiImages();
const galleryBox = new SimpleLightbox('.gallery a');

async function addImages(images) {
  if (images.length === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return;
  }

  const markup = cardTemplate(images);
  refs.galleryList.insertAdjacentHTML('beforeend', markup);
  galleryBox.refresh();

  await pixabayImages.getImages();
  Notiflix.Notify.info(`Hooray! We found ${pixabayImages.totalHits} images.`);

  if (pixabayImages.page * pixabayImages.perPage >= pixabayImages.totalHits) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

refs.searchForm.addEventListener('submit', handleSubmit);

async function handleSubmit(event) {
  event.preventDefault();
  const searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    return;
  }

  pixabayImages.query = searchQuery;
  pixabayImages.resetPage();
  refs.galleryList.innerHTML = '';
  await fetchImages();
}

async function fetchImages() {
  try {
    const images = await pixabayImages.getImages();
    await addImages(images);
  } catch (error) {
    console.log('Error fetching images:', error);
  }
}

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

const observer = new IntersectionObserver(handlerPagination, options);

function handlerPagination(entries) {
  entries.forEach(entry => {
    if (
      entry.isIntersecting &&
      pixabayImages.page * pixabayImages.perPage < pixabayImages.totalHits
    ) {
      pixabayImages.page += 1;
      fetchImages();
    }
  });

  if (
    pixabayImages.page * pixabayImages.perPage >= pixabayImages.totalHits &&
    pixabayImages.totalHits > 0
  ) {
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

observer.observe(refs.loadMore);
