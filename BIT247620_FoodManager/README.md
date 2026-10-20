# BIT247620 FoodManager

React Native app built with Expo SDK 58. The app stores data locally first, then syncs queued changes to MockAPI whenever the device is online.

## Run

```powershell
npm install
npx expo start
```

Open the project in Expo Go or an Android emulator. The Expo display name and slug are `BIT247620_FoodManager`.

## MockAPI setup

The project uses the configured endpoints in `src/foodData.js`:

- `https://6ad712f1f71f154ac487b390.mockapi.io/BIT247620_DishCategory`
- `https://6ad712f1f71f154ac487b390.mockapi.io/BIT247620_Dish`

No API URL is shown in the app UI. MockAPI's generated `id` is used for endpoint requests; app model identifiers and fields retain the required `BIT247620_` prefix. Existing server records are pulled into local storage before pending offline writes are synchronized.

The AsyncStorage key is `BIT247620_FoodManager_Data_v1`. Table-like collections and stored fields are declared in `src/foodData.js`; all model fields have the `BIT247620_` prefix. A dish stores a category ID and a list of image objects. Each image has `BIT247620_ImageUrl` and `BIT247620_IsThumbnail`.

## Offline and sync flow

1. Create or edit a dish while offline. It is written to AsyncStorage immediately and added to the prefixed pending-change queue.
2. `@react-native-community/netinfo` watches connectivity. When the device returns online, `syncPendingChanges` automatically processes the queue.
3. Each upsert includes the stable `BIT247620_Id` as a client ID. Before creating a remote row, sync looks for that client ID; retries update the existing row rather than creating a duplicate.
4. A queue item is removed only after its remote request succeeds. A failed request leaves local data and the queue intact for the next automatic retry.

## Demo checklist

- Show the Expo project name and `BIT247620` in the app header/source.
- Browse the 3 categories and 5 dishes loaded from MockAPI; open a detail with multiple photos.
- Add, edit, mark unavailable, and delete a dish; show confirmation and validation.
- Combine name, category, availability, price range, and sorting filters.
- Add/edit a category and show that an in-use category cannot be deleted.
- Switch English / Tiếng Việt and move between tabs.
- For the offline demo, turn off network, edit a dish, then restore network and show the sync status clear.

The app starts in English. User-entered dish names and descriptions are not translated.
