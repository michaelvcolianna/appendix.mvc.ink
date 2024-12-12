import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const defaultValue = 'hide';
const initialValue = browser
  ? (window.localStorage.getItem('spoilers') ?? defaultValue)
  : defaultValue;

const spoilers = writable(initialValue);

spoilers.subscribe((value) => {
  if (browser) {
    window.localStorage.setItem('spoilers', value);
  }
});

export default spoilers;
