import sqlite3

DATABASE = "agroguard.db"

connection = sqlite3.connect(DATABASE)
cursor = connection.cursor()

# Check existing columns in missions table
cursor.execute("PRAGMA table_info(missions)")
columns = [column[1] for column in cursor.fetchall()]

cursor.execute("PRAGMA table_info(farms)")
farm_columns = [column[1] for column in cursor.fetchall()]

if "farm_type" not in farm_columns:
    cursor.execute("ALTER TABLE farms ADD COLUMN farm_type TEXT")
    print("Added farm_type column")
else:
    print("farm_type already exists")

if "season" not in farm_columns:
    cursor.execute("ALTER TABLE farms ADD COLUMN season TEXT")
    print("Added season column")
else:
    print("season already exists")

# Add video_path if it doesn't exist
if "video_path" not in columns:
    cursor.execute(
        "ALTER TABLE missions ADD COLUMN video_path TEXT"
    )
    print("Added video_path column")
else:
    print("video_path already exists")

# Add detection_file if it doesn't exist
if "detection_file" not in columns:
    cursor.execute(
        "ALTER TABLE missions ADD COLUMN detection_file TEXT"
    )
    print("Added detection_file column")
else:
    print("detection_file already exists")

connection.commit()
connection.close()

print("Database migration completed successfully!")