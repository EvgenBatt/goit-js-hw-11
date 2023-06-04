import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { galleryMarkup } from './js/gallerymarkup';
import { fetchPics } from './js/pixabay-api';

export const refs = {
  formEl: document.querySelector('.search-form'),
  buttonEl: document.querySelector('.submit'),
  galleryEl: document.querySelector('.gallery'),
  inputEl: document.querySelector('input[name="searchQuery"]'),
  observer: document.querySelector('.observer'),
};

let currentPage = 1;
let currentValue = '';
let isNextPageLoad = false;
let isLastBatchLoaded = false;
let totalHits = 0;

const onFormSubmit = e => {
  e.preventDefault();
  const inputValue = refs.inputEl.value.trim();
  if (inputValue === '') {
    return;
  }
  currentPage = 1;
  currentValue = inputValue;
  refs.galleryEl.textContent = '';
  isNextPageLoad = false;
  isLastBatchLoaded = false;

  performSearch(currentValue);

  e.currentTarget.reset();
};

const performSearch = inputValue => {
  fetchPics(inputValue, currentPage)
    .then(data => {
      if (data.hits.length === 0 && currentPage === 1) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      if (!isNextPageLoad && currentPage === 1) {
        totalHits = data.totalHits;
        Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);
      }

      galleryMarkup(data);
      galleryLightbox.refresh();
      observer.observe(refs.observer);
      scrollToNextGroup();

      const remainingImages = totalHits - (currentPage - 1) * 40;
      if (remainingImages <= 0) {
        isLastBatchLoaded = true;
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
        return;
      }

      currentPage++;
      isNextPageLoad = true;
    })
    .catch(error => {
      console.error(error.message);
    })
    .finally(() => {
      isNextPageLoad = false;
    });
};

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 0,
};

const onLoadMore = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !isNextPageLoad && !isLastBatchLoaded) {
      const remainingImages = totalHits - (currentPage - 1) * 40;
      if (remainingImages <= 0) {
        observer.unobserve(refs.observer);
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        performSearch(currentValue);
      }
    }
  });
};

const observer = new IntersectionObserver(onLoadMore, options);

const optionsEl = { captionData: 'alt', captionDelay: '250' };
const galleryLightbox = new SimpleLightbox('.gallery a', optionsEl);

const scrollToNextGroup = () => {
  const { height: cardHeight } =
    refs.galleryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 0.2,
    behavior: 'smooth',
  });
};

refs.formEl.addEventListener('submit', onFormSubmit);
