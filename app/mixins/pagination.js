import Mixin from 'ember-metal/mixin';
import get from 'ember-metal/get';
import computed from 'ember-computed';
import service from 'ember-service/inject';
import { task } from 'ember-concurrency';
import { invokeAction } from 'ember-invoke-action';

/**
 * Pagination based on JSON-API's top level links object.
 */
export default Mixin.create({
  store: service(),

  /**
   * Grabs the latest `next` URL from the `links` object
   */
  nextLink: computed('model.links', function() {
    const model = get(this, 'model') || {};
    const links = get(model, 'links') || {};
    return get(links, 'next') || undefined;
  }),

  /**
   * Droppable task that queries the next set of data and sends an action
   * up to the owner.
   */
  getNextData: task(function* () {
    const nextLink = get(this, 'nextLink');
    if (nextLink === undefined) {
      return;
    }
    let model = get(this, 'model');
    model = get(model, 'firstObject') || model;
    let { modelName } = model.constructor;
    modelName = get(this, 'modelName') || modelName;
    const options = Object.assign(this._parseLink(nextLink), get(this, 'options'));
    const records = yield get(this, 'store').query(modelName, options);
    const links = get(records, 'links');
    invokeAction(this, 'update', records, links);
    return records;
  }).drop(),

  /**
   * Decodes and rebuilds the query params object from the URL passed.
   */
  _parseLink(link) {
    let url = window.decodeURI(link);
    url = url.split('?');
    if (url.length !== 2) {
      return {};
    }
    url = url[1].split('&');
    const filter = {};
    url.forEach((param) => {
      const option = param.split('=');
      if (option[0].includes('[') === true) {
        let value = option[1];
        const match = option[0].match(/(.+)\[(.+)\]/);
        if (match[1] === 'page') {
          if (match[2] === 'limit') {
            if (get(this, 'limit') !== undefined) {
              value = get(this, 'limit');
            }
          } else if (match[2] === 'offset') {
            if (get(this, 'offset') !== undefined) {
              value = get(this, 'offset');
            }
          }
        }
        filter[match[1]] = filter[match[1]] || {};
        filter[match[1]][match[2]] = decodeURIComponent(value);
      } else {
        filter[option[0]] = decodeURIComponent(option[1]);
      }
    });
    return filter;
  }
});
