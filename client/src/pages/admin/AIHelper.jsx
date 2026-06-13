import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bot,
  CheckCircle,
  Clipboard,
  FileText,
  Loader2,
  Megaphone,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

import {
  getCollections,
  getCollectionProgress,
} from "../../services/collectionService";
import { getPaymentsByCollection } from "../../services/paymentService";
import {
  generateAIAnnouncement,
  generateAICollectionSummary,
  generateAIReminder,
} from "../../services/aiService";

import { Toast } from "../../components/ui";

import "../../styles/pages/admin/AIHelper.css";

const AI_TOOL_TABS = [
  {
    id: "reminder",
    label: "Reminder Generator",
    description: "Create a payment reminder with tone and reminder type.",
    icon: MessageSquareText,
  },
  {
    id: "summary",
    label: "Collection Summary",
    description: "Summarize progress and recommend an admin action.",
    icon: FileText,
  },
  {
    id: "announcement",
    label: "Announcement Generator",
    description: "Draft a student-friendly announcement.",
    icon: Megaphone,
  },
];

const normalizeCollectionList = (data) => {
  const candidates = [
    data,
    data?.collections,
    data?.data,
    data?.data?.collections,
    data?.result,
    data?.result?.collections,
    data?.items,
  ];

  const collectionList = candidates.find(Array.isArray) || [];

  return collectionList.filter((collection) => collection?.id);
};

function AIHelper() {
  const navigate = useNavigate();

  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");

  const [payments, setPayments] = useState([]);
  const [progress, setProgress] = useState(null);

  const [tone, setTone] = useState("friendly");
  const [reminderType, setReminderType] = useState("general");
  const [instruction, setInstruction] = useState(
    "Remind students to settle their payment before the due date."
  );
  const [activeOutputType, setActiveOutputType] = useState("");
  const [generatedText, setGeneratedText] = useState("");
  const [source, setSource] = useState("");
  const [activeTool, setActiveTool] = useState("reminder");

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

  const selectedTool = useMemo(() => {
    return AI_TOOL_TABS.find((tool) => tool.id === activeTool);
  }, [activeTool]);

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

      setSelectedCollectionId((currentId) => {
        const currentCollectionStillExists = collectionList.some(
          (collection) => String(collection.id) === String(currentId)
        );

        if (currentCollectionStillExists) return currentId;
        if (collectionList.length > 0) return String(collectionList[0].id);
        return "";
      });
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
      setActiveOutputType("");
      loadSelectedCollectionData(selectedCollectionId);
    } else {
      setPayments([]);
      setProgress(null);
      setGeneratedText("");
      setSource("");
      setActiveOutputType("");
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
      instruction,
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
      setActiveOutputType("reminder");

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

      setMessage("AI-generated text copied.");
      setMessageType("success");
    } catch {
      setMessage("Unable to copy generated text.");
      setMessageType("error");
    }
  };

  const handleUseAsAnnouncement = () => {
    const aiDraft = generatedText.trim();

    if (!aiDraft) {
      setMessage("Generate or write announcement text first.");
      setMessageType("error");
      return;
    }

    navigate("/admin/announcements", {
      state: {
        aiDraft,
        selectedCollection,
      },
    });
  };

  const handleGenerateSummary = async () => {
    if (!selectedCollection) {
      setMessage("Please select a collection first.");
      setMessageType("error");
      return;
    }

    try {
      setGeneratingType("summary");
      setGeneratedText("");
      setSource("");
      setActiveOutputType("summary");

      const payload = buildPayload();
      const response = await generateAICollectionSummary(payload);

      setGeneratedText(response?.result?.text || "");
      setSource(response?.result?.source || "");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to generate AI summary."
      );
      setMessageType("error");
    } finally {
      setGeneratingType("");
    }
  };

  const handleGenerateAnnouncement = async () => {
    if (!selectedCollection) {
      setMessage("Please select a collection first.");
      setMessageType("error");
      return;
    }

    try {
      setGeneratingType("announcement");
      setGeneratedText("");
      setSource("");
      setActiveOutputType("announcement");

      const payload = buildPayload();
      const response = await generateAIAnnouncement(payload);

      setGeneratedText(response?.result?.text || "");
      setSource(response?.result?.source || "");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to generate AI announcement."
      );
      setMessageType("error");
    } finally {
      setGeneratingType("");
    }
  };

  const outputTitle = {
    reminder: "Generated Payment Reminder",
    summary: "Generated Collection Summary",
    announcement: "Generated Announcement",
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
            Generate payment reminders, collection summaries, and announcement
            drafts based on real PUPay collection data, payment status, and
            progress.
          </p>
        </div>

        <div className="ai-helper-hero-icon">
          <Bot size={34} />
        </div>
      </section>

      <section className="ai-helper-layout">
        <div className="ai-helper-control-panel">
          <div className="ai-helper-panel-header">
            <span className="ai-helper-step-label">Step 1</span>
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
            <span className="ai-helper-step-label">Step 2</span>
            <h3>AI Tools</h3>
            <p>Choose what you want PUPay AI to generate for this collection.</p>
          </div>

          <div className="ai-helper-tool-tabs" role="tablist" aria-label="AI tools">
            {AI_TOOL_TABS.map((tool) => {
              const ToolIcon = tool.icon;

              return (
                <button
                  key={tool.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTool === tool.id}
                  className={activeTool === tool.id ? "active" : ""}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <ToolIcon size={17} />
                  <span>{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="ai-helper-tool-config">
            <div className="ai-helper-selected-tool">
              {selectedTool && (
                <>
                  <strong>{selectedTool.label}</strong>
                  <p>{selectedTool.description}</p>
                </>
              )}
            </div>

            {activeTool === "reminder" && (
              <>
                <div className="ai-helper-options-grid">
                  <label className="ai-helper-field">
                    <span>Tone</span>

                    <select
                      value={tone}
                      onChange={(event) => setTone(event.target.value)}
                    >
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

                <button
                  type="button"
                  className="ai-helper-generate-btn"
                  onClick={handleGenerateReminder}
                  disabled={
                    !!generatingType || loadingCollectionData || !selectedCollection
                  }
                >
                  {generatingType === "reminder" ? (
                    <>
                      <Loader2 size={16} />
                      Generating Reminder...
                    </>
                  ) : (
                    <>
                      <MessageSquareText size={16} />
                      Generate Reminder
                    </>
                  )}
                </button>
              </>
            )}

            {activeTool === "summary" && (
              <div className="ai-helper-summary-tool">
                <p>
                  Uses the selected collection, progress, and payment stats to
                  produce a short admin-facing summary.
                </p>

                <button
                  type="button"
                  className="ai-helper-generate-btn"
                  onClick={handleGenerateSummary}
                  disabled={
                    !!generatingType || loadingCollectionData || !selectedCollection
                  }
                >
                  {generatingType === "summary" ? (
                    <>
                      <Loader2 size={16} />
                      Generating Summary...
                    </>
                  ) : (
                    <>
                      <FileText size={16} />
                      Generate Summary
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTool === "announcement" && (
              <>
                <label className="ai-helper-field">
                  <span>Announcement Instruction</span>

                  <textarea
                    value={instruction}
                    onChange={(event) => setInstruction(event.target.value)}
                    placeholder="Example: Remind students that payment is due tomorrow."
                    rows="4"
                  />
                </label>

                <button
                  type="button"
                  className="ai-helper-generate-btn"
                  onClick={handleGenerateAnnouncement}
                  disabled={
                    !!generatingType || loadingCollectionData || !selectedCollection
                  }
                >
                  {generatingType === "announcement" ? (
                    <>
                      <Loader2 size={16} />
                      Generating Announcement...
                    </>
                  ) : (
                    <>
                      <Megaphone size={16} />
                      Generate Announcement
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          <div className="ai-helper-output-panel">
            <div className="ai-helper-output-header">
              <div>
                <span className="ai-helper-step-label">Step 3</span>
                <h3>
                  {activeOutputType
                    ? outputTitle[activeOutputType]
                    : "Generated Output"}
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

              <div className="ai-helper-output-actions">
                <button
                  type="button"
                  className="ai-helper-use-btn"
                  onClick={handleUseAsAnnouncement}
                  disabled={!generatedText.trim()}
                >
                  <Megaphone size={16} />
                  Use as Announcement
                </button>

                <button
                  type="button"
                  className="ai-helper-copy-btn"
                  onClick={handleCopy}
                  disabled={!generatedText.trim()}
                >
                  <Clipboard size={16} />
                  Copy
                </button>
              </div>
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
