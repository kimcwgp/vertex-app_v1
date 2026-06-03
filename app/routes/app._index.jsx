import { useState, useCallback, useEffect } from "react";
import {
  AppProvider,
  Page,
  Layout,
  Card,
  Button,
  Text,
  TextField,
  Badge,
  BlockStack,
  InlineStack,
  Box,
  List,
  Frame,
  Toast,
  MediaCard, 
  VideoThumbnail,
  InlineGrid,
  Checkbox
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import { useLoaderData, useSubmit, useActionData } from "react-router";
import { authenticate } from "../shopify.server";
import styles from "../styles/home.css";

export const action = async ({ request }) => {
  try {
    const { admin } = await authenticate.admin(request);
    const formData = await request.formData();
    const spreadsheetUrl = formData.get("spreadsheetUrl");

    const shopResponse = await admin.graphql(`query { shop { id } }`);
    const shopData = await shopResponse.json();
    const shopId = shopData.data.shop.id;

    const result = await admin.graphql(`
      mutation {
        metafieldsSet(metafields: [{
          namespace: "cartbridge",
          key: "spreadsheet_url",
          value: ${JSON.stringify(spreadsheetUrl)},
          type: "single_line_text_field",
          ownerId: "${shopId}"
        }]) {
          metafields { id value }
          userErrors { field message }
        }
      }
    `);

    const data = await result.json();
    const userErrors = data?.data?.metafieldsSet?.userErrors;

    if (userErrors?.length > 0) {
      return { success: false, error: userErrors[0].message };
    }

    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const themeResponse = await admin.graphql(`
    query {
      themes(first: 10, roles: [MAIN]) {
        nodes {
          id
          files(filenames: ["config/settings_data.json"]) {
            nodes {
              filename
              body {
                ... on OnlineStoreThemeFileBodyText {
                  content
                }
              }
            }
          }
        }
      }
    }
  `);

  const themeData = await themeResponse.json();
  const themeNode = themeData?.data?.themes?.nodes?.[0];
  const fileContent = themeNode?.files?.nodes?.[0]?.body?.content;

  let isAppEmbedActive = false;

  if (fileContent) {
    const cleanedContent = fileContent.replace(/^\/\*[\s\S]*?\*\/\s*/, "");
    const settingsData = JSON.parse(cleanedContent);
    const blocks = settingsData?.current?.blocks || {};
    isAppEmbedActive = Object.values(blocks).some(
      (block) =>
        block.type?.includes("cartbridge-embed") && block.disabled !== true
    );
  }

  const metafieldResponse = await admin.graphql(`
    query {
      shop {
        metafield(namespace: "cartbridge", key: "spreadsheet_url") {
          value
        }
      }
    }
  `);

  const metafieldData = await metafieldResponse.json();
  const savedSpreadsheetUrl = metafieldData?.data?.shop?.metafield?.value || "";

  return {
    shop: session.shop,
    isAppEmbedActive,
    savedSpreadsheetUrl,
    appEmbedUuid: process.env.SHOPIFY_APP_EMBED_UUID,   // ✅ pass from server
    appEmbedHandle: process.env.SHOPIFY_APP_EMBED_HANDLE, // ✅ pass from server
  };
};

export default function Index() {
  const { shop, isAppEmbedActive, savedSpreadsheetUrl, appEmbedUuid, appEmbedHandle } = useLoaderData();
  const [spreadsheetUrl, setSpreadsheetUrl] = useState(savedSpreadsheetUrl);
  const submit = useSubmit();
  const themeEditorUrl = `https://${shop}/admin/themes/current/editor?context=apps&activateAppId=${appEmbedUuid}/${appEmbedHandle}`;

  const handleSave = () => {
    const formData = new FormData();
    formData.append("spreadsheetUrl", spreadsheetUrl);
    submit(formData, { method: "POST" });
  };

  const handleUrlChange = useCallback((value) => {
    setSpreadsheetUrl(value);
  }, []);

  const actionData = useActionData();
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  const [settings, setSettings] = useState({
    addToCart: true,
    removeTracking: true,
    quantityChange: true,
    checkout: true,
    exit: true,
    inactivity: true,
  });

  // Show toast when action completes
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        setToastMessage("Spreadsheet URL saved!");
        setToastError(false);
      } else {
        setToastMessage("Failed to save URL. Please try again.");
        setToastError(true);
      }
      setToastActive(true);
    }
  }, [actionData]);

  const toastMarkup = toastActive ? (
    <Toast
      content={toastMessage}
      error={toastError}
      onDismiss={() => setToastActive(false)}
    />
  ) : null;

  return (
    <AppProvider i18n={enTranslations}>
      <Frame>
        {toastMarkup}
        <s-page heading="CartBridge Sync" inline-size="base">
          <Layout>
            <Layout.Section>
              <BlockStack gap="400">
                {/* Theme App Embed */}
                <Card>
                  <BlockStack gap="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <InlineStack blockAlign="center" gap="200">
                        <Text variant="headingSm" as="h2">
                          Theme App Embed
                        </Text>
                        <Badge tone={isAppEmbedActive ? "success" : "attention"}>
                          {isAppEmbedActive ? "Active" : "Inactive"}
                        </Badge>
                      </InlineStack>
                      <Button size="slim">Need help?</Button>
                    </InlineStack>

                    <Text as="p" tone="subdued">
                      CartBridge theme app embed is not enabled on your published theme.
                    </Text>

                    <InlineStack>
                      <Button variant="primary" url={themeEditorUrl} external>
                        Enable App Embed
                      </Button>
                    </InlineStack>
                  </BlockStack>
                </Card>

                {/* Welcome Section */}
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingSm" as="h2">
                      Welcome to CartBridge Sync! Here's how to get you started
                    </Text>

                    <List type="bullet">
                      <List.Item>Enable it the app in Theme app Embed</List.Item>
                      <List.Item>Create a spreadsheet under your email or company email</List.Item>
                      <List.Item>Follow this spreadsheet guide</List.Item>
                    </List>

                    <Text tone="subdued">
                      Need help? Contact support anytime -- we're happy to assist.
                    </Text>

                    <Box>
                      <Button>Read setup guide</Button>
                    </Box>
                  </BlockStack>
                </Card>

                {/* Spreadsheet URL */}
                <Card>
                  <BlockStack gap="400">
                    <Text variant="headingSm" as="h2">
                      Spreadsheet Web API URL
                    </Text>

                    <InlineStack gap="300" blockAlign="center">
                      <div style={{ flex: 1 }}>
                        <TextField
                          label=""
                          value={spreadsheetUrl}
                          onChange={handleUrlChange}
                          placeholder="Paste URL"
                          autoComplete="off"
                        />
                      </div>
                      <Button variant="primary" onClick={handleSave}>Save</Button>
                    </InlineStack>
                  </BlockStack>
                </Card>

                {/* Tutorial Videos */}
                <Card>
                    <MediaCard
                    title="Lorem ipsum"
                      primaryAction={{
                        content: 'Learn more',
                        onAction: () => {},
                      }}
                      description={`Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`}
                      popoverActions={[{content: 'Dismiss', onAction: () => {}}]}>
                        <VideoThumbnail
                          videoLength={80}
                          thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                          onClick={() => console.log('clicked')}
                        />
                    </MediaCard>
                </Card>

                {/* Settings Section */}
                <Card>
                  <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">

                    {/* LEFT PANEL */}
                    <Card>
                      <div
                        style={{
                          position: "relative",
                        }}
                      >
                        {/* Overlay */}
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 10,
                          }}
                        >
                          <Button variant="primary" size="large">
                            Upgrade Plan
                          </Button>
                        </div>

                        {/* Disabled Content */}
                        <div
                          style={{
                            opacity: 0.4,
                            pointerEvents: "none",
                            userSelect: "none",
                          }}
                        >
                          <BlockStack gap="400">
                            <Text as="h2" variant="headingMd">
                              Edit
                            </Text>

                            <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
                              {/* Status Column */}
                              <BlockStack gap="300">
                                <Text as="h3" variant="bodyMd" fontWeight="medium">
                                  Personalize Status
                                </Text>

                                <TextField
                                  label=""
                                  value="add-to-cart"
                                  autoComplete="off"
                                />

                                <TextField
                                  label=""
                                  value="reach-checkout"
                                  autoComplete="off"
                                />

                                <TextField
                                  label=""
                                  value="beforeunload"
                                  autoComplete="off"
                                />

                                <Button size="slim">
                                  Add
                                </Button>
                              </BlockStack>

                              {/* Timer Column */}
                              <BlockStack gap="300">
                                <Text as="h3" variant="bodyMd" fontWeight="medium">
                                  Personalize Timer & Status
                                </Text>

                                <TextField
                                  label=""
                                  value="3000"
                                  autoComplete="off"
                                />

                                <TextField
                                  label=""
                                  value="5000"
                                  autoComplete="off"
                                />

                                <TextField
                                  label=""
                                  value="no-activity"
                                  autoComplete="off"
                                />
                              </BlockStack>
                            </InlineGrid>
                          </BlockStack>
                        </div>
                      </div>
                    </Card>

                    {/* RIGHT PANEL */}
                    <Card>
                      <BlockStack gap="300">
                        <Text as="h2" variant="headingMd">
                          Default
                        </Text>

                        <Checkbox
                          label="Enable Add-to-Cart Tracking"
                          checked={settings.addToCart}
                          onChange={(value) =>
                            setSettings({ ...settings, addToCart: value })
                          }
                        />

                        <Checkbox
                          label="Enable Remove Tracking"
                          checked={settings.removeTracking}
                          onChange={(value) =>
                            setSettings({ ...settings, removeTracking: value })
                          }
                        />

                        <Checkbox
                          label="Enable Quantity Change Tracking"
                          checked={settings.quantityChange}
                          onChange={(value) =>
                            setSettings({ ...settings, quantityChange: value })
                          }
                        />

                        <Checkbox
                          label="Enable Checkout Tracking"
                          checked={settings.checkout}
                          onChange={(value) =>
                            setSettings({ ...settings, checkout: value })
                          }
                        />

                        <Checkbox
                          label="Enable Exit Tracking"
                          checked={settings.exit}
                          onChange={(value) =>
                            setSettings({ ...settings, exit: value })
                          }
                        />

                        <Checkbox
                          label="Enable Inactivity Tracking"
                          checked={settings.inactivity}
                          onChange={(value) =>
                            setSettings({ ...settings, inactivity: value })
                          }
                        />

                        <InlineStack align="end">
                          <Button variant="primary">
                            Save
                          </Button>
                        </InlineStack>
                      </BlockStack>
                    </Card>

                  </InlineGrid>
                </Card>

                {/* Cancel subscription Section */}
                <div class="app-footer">
                  <p>The CartBridge Sync app by CW Global Partners. <a href="#">Privacy Policy</a> | <a href="#">Terms of Conditions</a></p>
                </div>

              </BlockStack>
            </Layout.Section>
          </Layout>
        </s-page>
      </Frame>
    </AppProvider>
  );
}