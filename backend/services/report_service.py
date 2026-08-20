from pathlib import Path
import json

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


def generate_mission_report(
    mission_id: int,
    mission_name: str,
    status: str,
    detection_file: str,
    zone_file: str,
    output_file: str,
):
    """
    Generate a professional AgroGuard AI mission PDF report.

    The report uses:
    - YOLO detection results
    - Detection-based severity assessment
    - Image-based 3x3 spatial risk zoning

    The spatial zoning is a demonstration-stage image-based
    analysis and is NOT a geographic affected-area calculation.
    """

    detection_path = Path(detection_file)
    zone_path = Path(zone_file)
    output_path = Path(output_file)

    if not detection_path.exists():
        raise FileNotFoundError(
            f"Detection file not found: {detection_path}"
        )

    if not zone_path.exists():
        raise FileNotFoundError(
            f"Zone analysis file not found: {zone_path}"
        )

    with open(
        detection_path,
        "r",
        encoding="utf-8"
    ) as file:
        detection_results = json.load(file)

    with open(
        zone_path,
        "r",
        encoding="utf-8"
    ) as file:
        zone_results = json.load(file)

    # ------------------------------------------------------
    # Detection summary
    # ------------------------------------------------------

    detections = []

    for frame in detection_results:

        for detection in frame.get(
            "detections",
            []
        ):

            detections.append(
                detection
            )

    total_detections = len(
        detections
    )

    confidence_values = [
        float(
            detection.get(
                "confidence",
                0
            )
        )
        for detection in detections
    ]

    average_confidence = (
        sum(confidence_values)
        / len(confidence_values)
        if confidence_values
        else 0.0
    )

    pest_counts = {}

    for detection in detections:

        pest_name = detection.get(
            "class_name",
            "Unknown"
        )

        pest_counts[pest_name] = (
            pest_counts.get(
                pest_name,
                0
            ) + 1
        )

    detected_pests = list(
        pest_counts.keys()
    )

    # ------------------------------------------------------
    # Severity calculation
    # ------------------------------------------------------

    if total_detections == 0:

        severity_score = 0.0
        severity_level = "LOW"

    else:

        severity_score = min(
            100.0,
            (
                total_detections * 5.0
                +
                average_confidence * 50.0
            )
        )

        if severity_score < 30:
            severity_level = "LOW"

        elif severity_score < 60:
            severity_level = "MODERATE"

        else:
            severity_level = "HIGH"

    # ------------------------------------------------------
    # Zone summary
    # ------------------------------------------------------

    zones = zone_results.get(
        "zones",
        []
    )

    summary = zone_results.get(
        "summary",
        {}
    )

    high_zone_count = summary.get(
        "high_risk_zone_count",
        0
    )

    moderate_zone_count = summary.get(
        "moderate_risk_zone_count",
        0
    )

    low_zone_count = summary.get(
        "low_risk_zone_count",
        0
    )

    # ------------------------------------------------------
    # Create output directory
    # ------------------------------------------------------

    output_path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # ------------------------------------------------------
    # PDF document
    # ------------------------------------------------------

    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "AgroGuardTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=27,
        alignment=TA_CENTER,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "AgroGuardSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.grey,
        spaceAfter=18,
    )

    section_style = ParagraphStyle(
        "AgroGuardSection",
        parent=styles["Heading2"],
        fontSize=15,
        leading=19,
        spaceBefore=12,
        spaceAfter=8,
    )

    normal_style = ParagraphStyle(
        "AgroGuardNormal",
        parent=styles["Normal"],
        fontSize=9.5,
        leading=14,
    )

    small_style = ParagraphStyle(
        "AgroGuardSmall",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=colors.grey,
    )

    severity_style = ParagraphStyle(
        "SeverityStyle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        spaceAfter=5,
    )

    story = []

    # ------------------------------------------------------
    # Header
    # ------------------------------------------------------

    story.append(
        Paragraph(
            "AgroGuard AI",
            title_style
        )
    )

    story.append(
        Paragraph(
            "UAV-Based Agricultural Pest Surveillance Report",
            subtitle_style
        )
    )

    # ------------------------------------------------------
    # Mission information
    # ------------------------------------------------------

    story.append(
        Paragraph(
            "Mission Information",
            section_style
        )
    )

    mission_table = Table(
        [
            [
                "Mission ID",
                str(mission_id)
            ],
            [
                "Mission Name",
                str(mission_name)
            ],
            [
                "Status",
                str(status)
            ],
            [
                "Frames Analysed",
                str(len(detection_results))
            ],
            [
                "Total Detections",
                str(total_detections)
            ],
        ],
        colWidths=[
            45 * mm,
            125 * mm
        ],
    )

    mission_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#eaf4e4")
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "FONTNAME",
                    (1, 0),
                    (1, -1),
                    "Helvetica"
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
            ]
        )
    )

    story.append(
        mission_table
    )

    # ------------------------------------------------------
    # Severity
    # ------------------------------------------------------

    story.append(
        Paragraph(
            "AI Severity Assessment",
            section_style
        )
    )

    story.append(
        Paragraph(
            severity_level,
            severity_style
        )
    )

    severity_table = Table(
        [
            [
                "Severity Score",
                f"{severity_score:.1f} / 100"
            ],
            [
                "Average Confidence",
                f"{average_confidence * 100:.1f}%"
            ],
            [
                "Detected Pest Types",
                str(len(detected_pests))
            ],
        ],
        colWidths=[
            65 * mm,
            105 * mm
        ],
    )

    severity_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#f1f8ee")
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
            ]
        )
    )

    story.append(
        severity_table
    )

    # ------------------------------------------------------
    # Detected pests
    # ------------------------------------------------------

    story.append(
        Paragraph(
            "Detected Pests",
            section_style
        )
    )

    if pest_counts:

        pest_rows = [
            [
                "Pest",
                "Detections"
            ]
        ]

        for pest_name, count in pest_counts.items():

            pest_rows.append(
                [
                    pest_name,
                    str(count)
                ]
            )

        pest_table = Table(
            pest_rows,
            colWidths=[
                120 * mm,
                50 * mm
            ],
            repeatRows=1
        )

        pest_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#eaf4e4")
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.lightgrey
                    ),
                    (
                        "PADDING",
                        (0, 0),
                        (-1, -1),
                        7
                    ),
                ]
            )
        )

        story.append(
            pest_table
        )

    else:

        story.append(
            Paragraph(
                "No pests were detected.",
                normal_style
            )
        )

    # ------------------------------------------------------
    # Spatial risk zones
    # ------------------------------------------------------

    story.append(
        PageBreak()
    )

    story.append(
        Paragraph(
            "Spatial Pest Risk Zoning",
            section_style
        )
    )

    story.append(
        Paragraph(
            "3 × 3 image-based demonstration risk grid",
            normal_style
        )
    )

    story.append(
        Spacer(
            1,
            8
        )
    )

    zone_rows = [
        [
            "Zone",
            "Risk",
            "Detections",
            "Confidence",
            "Pests"
        ]
    ]

    for zone in zones:

        zone_rows.append(
            [
                str(
                    zone.get(
                        "zone",
                        ""
                    )
                ),
                str(
                    zone.get(
                        "risk_level",
                        "LOW"
                    )
                ),
                str(
                    zone.get(
                        "total_detections",
                        0
                    )
                ),
                f"{float(zone.get('average_confidence', 0)) * 100:.1f}%",
                ", ".join(
                    zone.get(
                        "pest_counts",
                        {}
                    ).keys()
                ) or "-"
            ]
        )

    zone_table = Table(
        zone_rows,
        colWidths=[
            20 * mm,
            35 * mm,
            30 * mm,
            35 * mm,
            50 * mm
        ],
        repeatRows=1
    )

    zone_style_commands = [
        (
            "BACKGROUND",
            (0, 0),
            (-1, 0),
            colors.HexColor("#eaf4e4")
        ),
        (
            "FONTNAME",
            (0, 0),
            (-1, 0),
            "Helvetica-Bold"
        ),
        (
            "GRID",
            (0, 0),
            (-1, -1),
            0.5,
            colors.lightgrey
        ),
        (
            "PADDING",
            (0, 0),
            (-1, -1),
            6
        ),
    ]

    for row_index, zone in enumerate(
        zones,
        start=1
    ):

        risk_level = zone.get(
            "risk_level",
            "LOW"
        )

        if risk_level == "HIGH":

            background = colors.HexColor(
                "#f8d7da"
            )

        elif risk_level == "MODERATE":

            background = colors.HexColor(
                "#fff3cd"
            )

        else:

            background = colors.HexColor(
                "#dff3df"
            )

        zone_style_commands.append(
            (
                "BACKGROUND",
                (1, row_index),
                (1, row_index),
                background
            )
        )

    zone_table.setStyle(
        TableStyle(
            zone_style_commands
        )
    )

    story.append(
        zone_table
    )

    story.append(
        Spacer(
            1,
            10
        )
    )

    zone_summary_table = Table(
        [
            [
                "High Risk Zones",
                str(high_zone_count)
            ],
            [
                "Moderate Risk Zones",
                str(moderate_zone_count)
            ],
            [
                "Low Risk Zones",
                str(low_zone_count)
            ],
        ],
        colWidths=[
            65 * mm,
            105 * mm
        ],
    )

    zone_summary_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.lightgrey
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (0, -1),
                    "Helvetica-Bold"
                ),
                (
                    "PADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
            ]
        )
    )

    story.append(
        zone_summary_table
    )

    # ------------------------------------------------------
    # Advisory
    # ------------------------------------------------------

    story.append(
        Paragraph(
            "Agricultural Advisory",
            section_style
        )
    )

    story.append(
        Paragraph(
            "Pest detections have been identified in the analysed "
            "UAV mission. Inspect the affected crop area and follow "
            "the appropriate agricultural pest-management "
            "recommendation for the detected pest.",
            normal_style
        )
    )

    story.append(
        Spacer(
            1,
            8
        )
    )

    story.append(
        Paragraph(
            "AgroGuard AI provides decision-support information. "
            "Chemical application should follow local agricultural "
            "guidance and product-label instructions.",
            small_style
        )
    )

    # ------------------------------------------------------
    # Disclaimer
    # ------------------------------------------------------

    story.append(
        Spacer(
            1,
            15
        )
    )

    story.append(
        Paragraph(
            "Important: The spatial risk zoning in this report is "
            "an image-based demonstration analysis. It does not "
            "represent actual geographic affected field area. "
            "Real geographic zoning requires calibrated UAV, GPS "
            "and geospatial data.",
            small_style
        )
    )

    document.build(
        story
    )

    return str(
        output_path
    )
