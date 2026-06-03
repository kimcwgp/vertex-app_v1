import { useState } from "react";
import {
  AppProvider,
  BlockStack,
  InlineStack,
  Card,
  Text,
  Button,
  List,
  Badge,
  Divider,
  Box,
  Page,
  InlineGrid,
} from "@shopify/polaris";
import enTranslations from "@shopify/polaris/locales/en.json";
import styles from "../styles/plans.css";
const plans = [
  {
    name: "Basic Plan",
    subtitle: "Spreadsheet Sync",
    price: "5.99",
    annualPrice: "56.88",
    annualSavings: "20%",
    description:
      "Perfect for small businesses looking to organize their recovery efforts. This plan automatically captures every abandoned checkout—including customer IDs, product lists, and totals—and exports them directly to a Google Sheet or Excel file for easy tracking and manual follow-ups.",
    features: [
      "Unlimited Data Capture",
      "Real-Time Data Capture",
      "Automated Sync Spreadsheet",
      "Capture: Customer ID, Customer Email, Product Item, Quantities, Status, Total",
      "Online Support",
    ],
    badge: null,
    tone: "base",
  },
  {
    name: "Advanced Plan",
    subtitle: "Microsoft Excel Sync",
    price: "15.00",
    annualPrice: "144",
    annualSavings: "20%",
    description:
      "Designed for growing enterprises that need a unified workflow. This plan includes all Spreadsheet features plus a direct sync to NetSuite, automatically turning abandoned cart data into actionable leads or records within your ERP to streamline your sales and inventory management.",
    features: [
      "All Basic Features",
      "Microsoft Excel Sync",
      "Personalized Status",
      "Personalized Timing",
      "Online Support",
    ],
    badge: "Most popular",
    tone: "base",
  },
  {
    name: "Premium Plan",
    subtitle: "NetSuite Integration",
    price: "30.00",
    annualPrice: "288",
    annualSavings: "20%",
    description:
      "Designed for growing enterprises that need a unified workflow. This plan includes all Spreadsheet features plus a direct sync to NetSuite, automatically turning abandoned cart data into actionable leads or records within your ERP to streamline your sales and inventory management.",
    features: [
      "All Basic & Advanced Features",
      "NetSuite Sync",
      "Premium Support",
    ],
    badge: null,
    tone: "base",
  },
];

export default function PlansPage() {
  const [selected, setSelected] = useState(null);

  return (
    <AppProvider i18n={enTranslations}>
      <s-page heading="CartBridge Sync">
        <Text variant="headingLg" as="h2">
          Monthly Payment Plans
        </Text>

        {/* Plans Section */}
        <div class="plans-grid">
          <div class="plan-card">
            <div class="inner-plan-card">
              <div class="plan-header">
                <div class="inner-plan-header">
                  <div class="plan-title-div">
                    <p class="plan-title">Basic Plan:</p>
                    <p class="plan-name">Spreadsheet Sync</p>
                  </div>
                  <div class="plan-price">
                    <span class="plan-price-amount">$5.99</span>
                    <span class="plan-price-period">/ month</span>
                  </div>
                  <p class="plan-annual">or $56.88/year and save 20%</p>
                </div>
                <Badge tone="success"> Current Plan </Badge>
              </div>

              <hr class="divider" />

              <p class="plan-description">
                Perfect for small businesses looking to organize their recovery
                efforts. This plan automatically captures every abandoned
                checkout—including customer IDs, product lists, and totals—and
                exports them directly to a Google Sheet or Excel file for easy
                tracking and manual follow-ups.
              </p>

              <hr class="divider" />

              <div class="plan-features">
                <h3 class="plan-features-title">Features</h3>
                <ul class="plan-features-list">
                  <li>Unlimited Data Capture</li>
                  <li>Real-Time Data Capture</li>
                  <li>Automated Sync Spreadsheet</li>
                  <li>
                    Capture: Customer ID, Customer Email, Product Item,
                    Quantities, Status, Total
                  </li>
                  <li>Online Support</li>
                </ul>
              </div>
            </div>
            <div class="plan-footer-div">
              <Button variant="primary" disabled>
                Select
              </Button>
              <p class="plan-trial">10-day free trial</p>
            </div>
          </div>

          <div class="plan-card">
            <div class="inner-plan-card">
              <div class="plan-header">
                <div class="inner-plan-header">
                  <div class="plan-title-div">
                    <p class="plan-title">Advanced Plan:</p>
                    <p class="plan-name">Microsoft Excel Sync</p>
                  </div>

                  <div class="plan-price">
                    <span class="plan-price-amount">$15.00</span>
                    <span class="plan-price-period">/ month</span>
                  </div>

                  <p class="plan-annual">or $144/year and save 20%</p>
                </div>
              </div>

              <hr class="divider" />

              <p class="plan-description">
                Designed for growing enterprises that need a unified workflow.
                This plan includes all Spreadsheet features plus a direct sync
                to NetSuite, automatically turning abandoned cart data into
                actionable leads or records within your ERP to streamline your
                sales and inventory management
              </p>

              <hr class="divider" />

              <div class="plan-features">
                <h3 class="plan-features-title">Features</h3>
                <ul class="plan-features-list">
                  <li>All Basic Features</li>
                  <li>Microsoft Excel Sync</li>
                  <li>Personalized Status</li>
                  <li>Personalized Timing</li>
                  <li>Online Support</li>
                </ul>
              </div>
            </div>
            <div class="plan-footer-div">
              <Button variant="primary">Select</Button>
              <p class="plan-trial">10-day free trial</p>
            </div>
          </div>

          <div class="plan-card">
            <div class="inner-plan-card">
              <div class="plan-header">
                <div class="inner-plan-header">
                  <div class="plan-title-div">
                    <p class="plan-title">Premium Plan:</p>
                    <p class="plan-name">NetSuite Integration</p>
                  </div>

                  <div class="plan-price">
                    <span class="plan-price-amount">$30.00</span>
                    <span class="plan-price-period">/ month</span>
                  </div>

                  <p class="plan-annual">or $288/year and save 20%</p>
                </div>
              </div>

              <hr class="divider" />

              <p class="plan-description">
                Designed for growing enterprises that need a unified workflow.
                This plan includes all Spreadsheet features plus a direct sync
                to NetSuite, automatically turning abandoned cart data into
                actionable leads or records within your ERP to streamline your
                sales and inventory management
              </p>

              <hr class="divider" />

              <div class="plan-features">
                <h3 class="plan-features-title">Features</h3>
                <ul class="plan-features-list">
                  <li>All Basic & Advanced Features</li>
                  <li>NetSuite Sync</li>
                  <li>Premium Support</li>
                </ul>
              </div>
            </div>
            <div class="plan-footer-div">
              <Button variant="primary">Select</Button>
              <p class="plan-trial">10-day free trial</p>
            </div>
          </div>
        </div>

        {/* Cancel subscription Section */}
        <div class="cancel-subscription-card">
          <p class="cancel-subscription-heading">
            Do you want to cancel your CartBridge subscription?
          </p>
          <p class="cancel-subscription-description">
            Canceling your subscription will stop all your setup and data
            captures on your store.
          </p>
          <Box>
            <Button>Cancel Subscription</Button>
          </Box>
        </div>

        {/* Cancel subscription Section */}
        <div class="app-footer">
          <p>The CartBridge Sync app by CW Global Partners. <a href="#">Privacy Policy</a> | <a href="#">Terms of Conditions</a></p>
        </div>

      </s-page>
    </AppProvider>
  );
}
