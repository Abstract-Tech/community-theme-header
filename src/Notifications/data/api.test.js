import MockAdapter from 'axios-mock-adapter';
import { Factory } from 'rosie';

import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { initializeMockApp } from '@edx/frontend-platform/testing';

import {
  getNotificationsApiUrl, getNotificationsCountApiUrl, markNotificationAsReadApiUrl, markNotificationsSeenApiUrl,
  getNotificationCounts, getNotifications, markNotificationSeen, markAllNotificationRead, markNotificationRead,
} from './api';

import './__factories__';

const notificationCountsApiUrl = getNotificationsCountApiUrl();
const notificationsApiUrl = getNotificationsApiUrl();
const markedAllNotificationsAsSeenApiUrl = markNotificationsSeenApiUrl('discussions');
const markedAllNotificationsAsReadApiUrl = markNotificationAsReadApiUrl();

let axiosMock = null;

describe('Notifications API', () => {
  beforeEach(async () => {
    initializeMockApp({
      authenticatedUser: {
        userId: '123abc',
        username: 'testuser',
        administrator: false,
        roles: [],
      },
    });
    axiosMock = new MockAdapter(getAuthenticatedHttpClient());
    Factory.resetAll();
  });

  afterEach(() => {
    axiosMock.reset();
  });

  it('Successfully get notification counts for different tabs.', async () => {
    axiosMock.onGet(notificationCountsApiUrl).reply(200, (Factory.build('notificationsCount')));

    const { count, countByAppName } = await getNotificationCounts();

    expect(count).toEqual(45);
    expect(countByAppName.reminders).toEqual(10);
    expect(countByAppName.discussions).toEqual(20);
    expect(countByAppName.grades).toEqual(10);
    expect(countByAppName.authoring).toEqual(5);
  });

  it.each([
    { statusCode: 404, message: 'Failed to get notification counts.' },
    { statusCode: 403, message: 'Denied to get notification counts.' },
  ])('%s for notification counts API.', async ({ statusCode, message }) => {
    axiosMock.onGet(notificationCountsApiUrl).reply(statusCode, { message });
    try {
      await getNotificationCounts();
    } catch (error) {
      expect(error.response.status).toEqual(statusCode);
      expect(error.response.data.message).toEqual(message);
    }
  });

  it('Successfully get notifications.', async () => {
    axiosMock.onGet(notificationsApiUrl).reply(
      200,
      (Factory.buildList('notification', 2, null, { createdDate: new Date().toISOString() })),
    );

    const { notifications } = await getNotifications('discussions', 1, 10);

    expect(notifications).toHaveLength(2);
  });

  it.each([
    { statusCode: 404, message: 'Failed to get notifications.' },
    { statusCode: 403, message: 'Denied to get notifications.' },
  ])('%s for notification API.', async ({ statusCode, message }) => {
    axiosMock.onGet(notificationsApiUrl).reply(statusCode, { message });
    try {
      await getNotifications({ page: 1, pageSize: 10 });
    } catch (error) {
      expect(error.response.status).toEqual(statusCode);
      expect(error.response.data.message).toEqual(message);
    }
  });

  it('Successfully marked all notifications as seen for selected app.', async () => {
    axiosMock.onPut(markedAllNotificationsAsSeenApiUrl).reply(200, { message: 'Notifications marked seen.' });

    const { message } = await markNotificationSeen('discussions');

    expect(message).toEqual('Notifications marked seen.');
  });

  it.each([
    { statusCode: 404, message: 'Failed to mark all notifications as seen for selected app.' },
    { statusCode: 403, message: 'Denied to mark all notifications as seen for selected app.' },
  ])('%s for notification mark as seen API.', async ({ statusCode, message }) => {
    axiosMock.onPut(markedAllNotificationsAsSeenApiUrl).reply(statusCode, { message });
    try {
      await markNotificationSeen('discussions');
    } catch (error) {
      expect(error.response.status).toEqual(statusCode);
      expect(error.response.data.message).toEqual(message);
    }
  });

  it('Successfully marked all notifications as read for selected app.', async () => {
    axiosMock.onPut(markedAllNotificationsAsReadApiUrl).reply(200, { message: 'Notifications marked read.' });

    const { message } = await markAllNotificationRead('discussions');

    expect(message).toEqual('Notifications marked read.');
  });

  it.each([
    { statusCode: 404, message: 'Failed to mark all notifications as read for selected app.' },
    { statusCode: 403, message: 'Denied to mark all notifications as read for selected app.' },
  ])('%s for notification mark all as read API.', async ({ statusCode, message }) => {
    axiosMock.onPut(markedAllNotificationsAsReadApiUrl).reply(statusCode, { message });
    try {
      await markAllNotificationRead('discussions');
    } catch (error) {
      expect(error.response.status).toEqual(statusCode);
      expect(error.response.data.message).toEqual(message);
    }
  });

  it('Successfully marked notification as read.', async () => {
    axiosMock.onPut(markedAllNotificationsAsReadApiUrl).reply(200, { message: 'Notification marked read.' });

    const { data } = await markNotificationRead(1);

    expect(data.message).toEqual('Notification marked read.');
  });

  it.each([
    { statusCode: 404, message: 'Failed to mark notification as read.' },
    { statusCode: 403, message: 'Denied to mark notification as read.' },
  ])('%s for notification mark as read API.', async ({ statusCode, message }) => {
    axiosMock.onPut(markedAllNotificationsAsReadApiUrl).reply(statusCode, { message });
    try {
      await markAllNotificationRead(1);
    } catch (error) {
      expect(error.response.status).toEqual(statusCode);
      expect(error.response.data.message).toEqual(message);
    }
  });
});
