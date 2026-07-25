import pandas as pd
import torch
from torch.utils.data import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer
)

# 1. DistilBERT Tokenizer load karo
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")

# 2. Pandas se direct CSV dataset load karo
df = pd.read_csv("../dataset/scam_messages.csv")

# Labels ko numbers me badlo
label_map = {"safe": 0, "scam": 1}
df["label"] = df["label"].map(label_map)

# 3. Custom PyTorch Dataset class banayein (Tension free data pipeline)
class ScamDataset(Dataset):
    def __init__(self, texts, labels, tokenizer, max_len=64):
        self.texts = texts.tolist()
        self.labels = labels.tolist()
        self.tokenizer = tokenizer
        self.max_len = max_len

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        text = str(self.texts[idx])
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            truncation=True,
            padding="max_length",
            max_length=self.max_len,
            return_tensors="pt"
        )

        return {
            "input_ids": encoding["input_ids"].flatten(),
            "attention_mask": encoding["attention_mask"].flatten(),
            "label": torch.tensor(label, dtype=torch.long)
        }

# Training dataset taiyar karo
train_dataset = ScamDataset(df["text"], df["label"], tokenizer)

# 4. DistilBERT model load karo
print("\nModel load ho raha hai, thoda wait karein...")
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased",
    num_labels=2
)
print("✅ Model Loaded Successfully!")

# 5. Training Configuration
training_args = TrainingArguments(
    output_dir="../model",
    num_train_epochs=3,
    per_device_train_batch_size=2,
    logging_steps=1,
    save_strategy="epoch",
    learning_rate=2e-5,
    remove_unused_columns=False  # Custom dataset ke liye zaroori hai
)

# 6. Trainer Initialization
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset
)

# 7. Training Start Karo
print("\n🚀 Training Started...")
trainer.train()
print("✅ Training Completed!")

# 8. Model aur Tokenizer Save Karo
trainer.save_model("../model/scam_detector")
tokenizer.save_pretrained("../model/scam_detector")
print("\n✅ Model Saved Successfully!")