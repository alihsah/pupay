import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Clipboard,
  Loader2,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import {
  getCollections,
  getCollectionProgress,
} from "../../services/collectionService";
import { getPaymentsByCollection } from "../../services/paymentService";
import { generateAIReminder } from "../../services/aiService";

import { Toast } from "../../components/ui";

import "../../styles/pages/admin/AIHelper.css";

const normalizeCollectionList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.collections)) return data.collections;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

function AIHelper() {
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [payments, setPayments] = useState([]);
  const [progress, setProgress] = useState(null);

  const [tone, setTone] = useState("friendly");
  const [reminderType, setReminderType] = useState("general");
  const [generatedText, setGeneratedText] = useState("");
  const [source, setSource] = useState("");

  const [loadingCollections, setLoadingCollections] = useState(true);
  const [loadingCollectionData, setLoadingCollectionData] = useState(false);
  const [generatingType, setGeneratingType] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const selectedCollection = useMemo(() => {
    return collections.find(
      (collection) => String(collection.id) === String(selectedCollectionId)
    );
  }, [collections, selectedCollectionId]);

  const stats = useMemo(() => {
    const totalStudents = payments.length;
    const paidCount = payments.filter(
      (payment) => payment.status === "paid"
    ).length;
    const pendingCount = payments.filter(
      (payment) => payment.status === "pending"
    ).length;
    const overdueCount = payments.filter(
      (payment) => payment.status === "overdue"
    ).length;

    const totalCollected = payments
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + Number(payment.amount_paid || 0), 0);

    return {
      totalStudents,
      paidCount,
      pendingCount,
      overdueCount,
      totalCollected,
    };
  }, [payments]);

  const loadCollections = async () => {
    try {
      setLoadingCollections(true);

      const data = await getCollections();
      const collectionList = normalizeCollectionList(data);

      setCollections(collectionList);

      if (collectionList.length > 0) {
        setSelectedCollectionId(String(collectionList[0].id));
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load collections."
      );
      setMessageType("error");
    } finally {
      setLoadingCollections(false);
    }
  };

  const loadSelectedCollectionData = async (collectionId) => {
    if (!collectionId) return;

    try {
      setLoadingCollectionData(true);

      const [paymentData, progressData] = await Promise.all([
        getPaymentsByCollection(collectionId),
        getCollectionProgress(collectionId),
      ]);

      setPayments(Array.isArray(paymentData) ? paymentData : []);
      setProgress(progressData);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to load collection data."
      );
      setMessageType("error");
    } finally {
      setLoadingCollectionData(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  useEffect(() => {
    if (selectedCollectionId) {
      setGeneratedText("");
      setSource("");
      loadSelectedCollectionData(selectedCollectionId);
    }
  }, [selectedCollectionId]);

  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("en-PH", {
      style: "currency",
      currency: "PHP",
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const buildPayload = () => {
    return {
      collection: selectedCollection,
      progress,
      stats,
      tone,
      reminderType,
    };
  };

  const handleGenerateReminder = async () => {
    if (!selectedCollection) {
      setMessage("Please select a collection first.");
      setMessageType("error");
      return;
    }

    try {
      setGeneratingType("reminder");
      setGeneratedText("");
      setSource("");

      const payload = buildPayload();
      const response = await generateAIReminder(payload);

      setGeneratedText(response?.result?.text || "");
      setSource(response?.result?.source || "");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to generate AI text.");
      setMessageType("error");
    } finally {
      setGeneratingType("");
    }
  };

  const handleCopy = async () => {
    if (!generatedText) return;

    try {
      await navigator.clipboard.writeText(generatedText);

      setMessage("AI-generated reminder copied.");
      setMessageType("success");
    } catch {
      setMessage("Unable to copy reminder text.");
      setMessageType("error");
    }
  };

  return (
    <main className="ai-helper-page">
      <Toast
        message={message}
        type={messageType}
        onClose={() => {
          setMessage("");
          setMessageType("");
        }}
      />

      <section className="ai-helper-hero">
        <div>
          <p className="ai-helper-eyebrow">
            <Sparkles size={16} />
            Admin AI Assistant
          </p>

          <h2>AI Helper</h2>

          <p>
            Generate payment reminder drafts based on real PUPay collection
            data, payment status, and collection progress.
          </p>
        </div>

        <div className="ai-helper-hero-icon">
          <Bot size={34} />
        </div>
      </section>

      <section className="ai-helper-layout">
        <div className="ai-helper-control-panel">
          <div className="ai-helper-panel-header">
            <h3>Collection Source</h3>
            <p>Select a collection so the AI can use its payment progress.</p>
          </div>

          <label className="ai-helper-field">
            <span>Collection</span>

            <select
              value={selectedCollectionId}
              onChange={(event) => setSelectedCollectionId(event.target.value)}
              disabled={loadingCollections}
            >
              {loadingCollections && <option>Loading collections...</option>}

              {!loadingCollections && collections.length === 0 && (
                <option value="">No collections found</option>
              )}

              {!loadingCollections &&
                collections.map((collection) => (
                  <option key={collection.id} value={collection.id}>
                    {collection.title}
                  </option>
                ))}
            </select>
          </label>

          {selectedCollection && (
            <div className="ai-helper-collection-card">
              <div>
                <h4>{selectedCollection.title}</h4>
                <p>{selectedCollection.description || "No description."}</p>
              </div>

              <div className="ai-helper-collection-meta">
                <span>Goal: {formatCurrency(selectedCollection.goal_amount)}</span>
                <span>
                  Contribution: {formatCurrency(selectedCollection.amount)}
                </span>
                <span>Due: {formatDate(selectedCollection.due_date)}</span>
              </div>
            </div>
          )}

          <div className="ai-helper-stats-grid">
            <div className="ai-helper-stat-card">
              <span>Total Students</span>
              <strong>{stats.totalStudents}</strong>
            </div>

            <div className="ai-helper-stat-card paid">
              <span>Paid</span>
              <strong>{stats.paidCount}</strong>
            </div>

            <div className="ai-helper-stat-card pending">
              <span>Pending</span>
              <strong>{stats.pendingCount}</strong>
            </div>

            <div className="ai-helper-stat-card overdue">
              <span>Overdue</span>
              <strong>{stats.overdueCount}</strong>
            </div>
          </div>

          {progress && (
            <div className="ai-helper-progress-box">
              <div>
                <span>Collection Progress</span>
                <strong>{progress.progress || 0}%</strong>
              </div>

              <div className="ai-helper-progress-track">
                <div
                  className="ai-helper-progress-fill"
                  style={{ width: `${progress.progress || 0}%` }}
                />
              </div>

              <p>
                {formatCurrency(progress.totalCollected)} collected out of{" "}
                {formatCurrency(progress.goalAmount)}
              </p>
            </div>
          )}

          {loadingCollectionData && (
            <p className="ai-helper-loading-text">
              <Loader2 size={16} />
              Loading selected collection data...
            </p>
          )}
        </div>

        <div className="ai-helper-tools-panel">
          <div className="ai-helper-panel-header">
            <h3>AI Reminder Generator</h3>
            <p>Choose the tone and reminder type for this collection.</p>
          </div>

          <div className="ai-helper-options-grid">
            <label className="ai-helper-field">
              <span>Tone</span>

              <select value={tone} onChange={(event) => setTone(event.target.value)}>
                <option value="friendly">Friendly</option>
                <option value="formal">Formal</option>
                <option value="urgent">Urgent</option>
              </select>
            </label>

            <label className="ai-helper-field">
              <span>Reminder Type</span>

              <select
                value={reminderType}
                onChange={(event) => setReminderType(event.target.value)}
              >
                <option value="general">General Reminder</option>
                <option value="pending">Pending Payments</option>
                <option value="overdue">Overdue Payments</option>
                <option value="final">Final Reminder</option>
              </select>
            </label>
          </div>

          <div className="ai-helper-tool-grid">
            <button
              type="button"
              className="ai-helper-tool-card"
              onClick={handleGenerateReminder}
              disabled={!!generatingType || loadingCollectionData}
            >
              <MessageSquareText size={22} />
              <span>Generate Reminder</span>
              <small>Generate a payment reminder for students.</small>

              {generatingType === "reminder" && (
                <em>
                  <Loader2 size={14} />
                  Generating...
                </em>
              )}
            </button>
          </div>

          <div className="ai-helper-output-panel">
            <div className="ai-helper-output-header">
              <div>
                <h3>
                  Generated Payment Reminder
                </h3>

                <p>
                  {source === "gemini" && (
                    <>
                      <CheckCircle size={14} />
                      Generated using Gemini API
                    </>
                  )}

                  {source === "fallback" && (
                    <>
                      <AlertTriangle size={14} />
                      Fallback text used
                    </>
                  )}

                  {!source && "Your generated AI text will appear here."}
                </p>
              </div>

              <button
                type="button"
                className="ai-helper-copy-btn"
                onClick={handleCopy}
                disabled={!generatedText}
              >
                <Clipboard size={16} />
                Copy
              </button>
            </div>

            <textarea
              className="ai-helper-output-textarea"
              value={generatedText}
              onChange={(event) => setGeneratedText(event.target.value)}
              placeholder="Generated AI output..."
              rows="9"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

export default AIHelper;
