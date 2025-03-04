import { author } from "./author";
import { blog } from "./blog";
import { blogIndex } from "./blog-index";
import { faq } from "./faq";
import { footer } from "./footer";
import { homePage } from "./home-page";
import { navbar } from "./navbar";
import { page } from "./page";
import { productType } from "./product";
import { productPageType } from "./product-page";
import { scormType } from "./scorm";
import { settings } from "./settings";
export const singletons = [homePage, blogIndex, settings, footer, navbar];

export const documents = [
  blog,
  page,
  faq,
  author,
  productType,
  scormType,
  productPageType,
  ...singletons,
];
