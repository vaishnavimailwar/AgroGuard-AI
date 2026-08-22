from pathlib import Path
import json

from services.spray_advisory_service import generate_spray_advisory

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


# ============================================================
# PAGE HEADER / FOOTER
# ============================================================

def _draw_page(canvas, document):

    canvas.saveState()

    width, height = A4

    # Header
    canvas.setStrokeColor(colors.HexColor("#D9E5D5"))
    canvas.line(
        40,
        height - 32,
        width - 40,
        height - 32
    )

    canvas.setFont(
        "Helvetica-Bold",
        8
    )

    canvas.setFillColor(
        colors.HexColor("#42613D")
    )

    canvas.drawString(
        40,
        height - 24,
        "AGROGUARD AI"
    )

    canvas.setFont(
        "Helvetica",
        8
    )

    canvas.setFillColor(
        colors.HexColor("#6B7280")
    )

    canvas.drawRightString(
        width - 40,
        height - 24,
        "Mission Intelligence Report"
    )

    # Footer
    canvas.setStrokeColor(
        colors.HexColor("#E5E7EB")
    )

    canvas.line(
        40,
        35,
        width - 40,
        35
    )

    canvas.setFont(
        "Helvetica",
        8
    )

    canvas.setFillColor(
        colors.HexColor("#6B7280")
    )

    canvas.drawString(
        40,
        23,
        "AgroGuard AI • Decision Support System"
    )

    canvas.drawRightString(
        width - 40,
        23,
        f"Page {document.page}"
    )

    canvas.restoreState()


# ============================================================
# SAFE HELPERS
# ============================================================

def _safe_float(
    value,
    default=0.0
):

    try:
        return float(value)
    except (
        TypeError,
        ValueError
    ):
        return default


def _safe_text(
    value,
    default="Not specified"
):

    if value is None:
        return default

    value = str(value).strip()

    if not value:
        return default

    return value


def _load_json(path):

    path = Path(path)

    if not path.exists():
        raise FileNotFoundError(
            f"JSON file not found: {path}"
        )

    with open(
        path,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def _get_detection_frames(
    detection_data
):

    if isinstance(
        detection_data,
        dict
    ):

        frames = detection_data.get(
            "frames",
            []
        )

        if isinstance(
            frames,
            list
        ):
            return frames

        return []

    if isinstance(
        detection_data,
        list
    ):
        return detection_data

    return []


# ============================================================
# RISK COLORS
# ============================================================

def _risk_colors(
    risk_level
):

    risk_level = str(
        risk_level or "LOW"
    ).upper()

    if risk_level == "HIGH":

        return (
            colors.HexColor("#DC2626"),
            colors.white
        )

    if risk_level == "MODERATE":

        return (
            colors.HexColor("#F59E0B"),
            colors.white
        )

    return (
        colors.HexColor("#16A34A"),
        colors.white
    )


# ============================================================
# GENERATE MISSION REPORT
# ============================================================

def generate_mission_report(
    mission_id: int,
    mission_name: str,
    status: str,
    detection_file: str,
    zone_file: str,
    output_file: str
):

    # ========================================================
    # PATHS
    # ========================================================

    detection_file = Path(
        detection_file
    )

    zone_file = Path(
        zone_file
    )

    output_file = Path(
        output_file
    )

    output_file.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    # ========================================================
    # LOAD DATA
    # ========================================================

    detection_data = _load_json(
        detection_file
    )

    zone_data = _load_json(
        zone_file
    )

    frames = _get_detection_frames(
        detection_data
    )

    # ========================================================
    # DETECTION STATISTICS
    # ========================================================

    total_frames = len(
        frames
    )

    total_detections = 0

    confidence_sum = 0.0

    pest_counts = {}

    pest_confidences = {}

    # IMPORTANT:
    # We preserve the frame order exactly as produced
    # by the detector.

    for frame in frames:

        if not isinstance(
            frame,
            dict
        ):
            continue

        detections = frame.get(
            "detections",
            []
        )

        if not isinstance(
            detections,
            list
        ):
            continue

        for detection in detections:

            if not isinstance(
                detection,
                dict
            ):
                continue

            pest_name = (
                detection.get(
                    "class_name"
                )
                or detection.get(
                    "pest"
                )
                or "Unknown"
            )

            pest_name = str(
                pest_name
            )

            confidence = _safe_float(
                detection.get(
                    "confidence",
                    0
                )
            )

            total_detections += 1

            confidence_sum += confidence

            pest_counts[pest_name] = (
                pest_counts.get(
                    pest_name,
                    0
                )
                + 1
            )

            if pest_name not in pest_confidences:

                pest_confidences[
                    pest_name
                ] = []

            pest_confidences[
                pest_name
            ].append(
                confidence
            )

    if total_detections > 0:

        average_confidence = (
            confidence_sum
            /
            total_detections
        )

    else:

        average_confidence = 0.0

    # ========================================================
    # ZONE INFORMATION
    # ========================================================

    zones = []

    if isinstance(
        zone_data,
        dict
    ):

        zones = zone_data.get(
            "zones",
            []
        )

    if not isinstance(
        zones,
        list
    ):

        zones = []

    # Sort by actual zone number.
    # This guarantees 1,2,3...9 order.

    def zone_sort_key(zone):

        if not isinstance(
            zone,
            dict
        ):
            return 999999

        try:
            return int(
                zone.get(
                    "zone",
                    999999
                )
            )
        except (
            TypeError,
            ValueError
        ):
            return 999999

    zones = sorted(
        zones,
        key=zone_sort_key
    )

    high_zones = []
    moderate_zones = []
    low_zones = []

    for zone in zones:

        if not isinstance(
            zone,
            dict
        ):
            continue

        risk_level = str(
            zone.get(
                "risk_level",
                "LOW"
            )
        ).upper()

        zone_number = zone.get(
            "zone",
            "?"
        )

        if risk_level == "HIGH":

            high_zones.append(
                zone_number
            )

        elif risk_level == "MODERATE":

            moderate_zones.append(
                zone_number
            )

        else:

            low_zones.append(
                zone_number
            )

    # ========================================================
    # REPORT SEVERITY
    # ========================================================

    if high_zones:

        report_severity = "HIGH"

    elif moderate_zones:

        report_severity = "MODERATE"

    else:

        report_severity = "LOW"

    # ========================================================
    # STYLES
    # ========================================================

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "AgroGuardTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=colors.HexColor("#29472A"),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        "AgroGuardSubtitle",
        parent=styles["BodyText"],
        alignment=TA_CENTER,
        fontName="Helvetica",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#6B7280"),
        spaceAfter=16
    )

    heading_style = ParagraphStyle(
        "AgroGuardHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=colors.HexColor("#29472A"),
        spaceBefore=12,
        spaceAfter=8
    )

    section_label_style = ParagraphStyle(
        "AgroGuardSection",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#42613D"),
        spaceBefore=6,
        spaceAfter=5
    )

    normal_style = ParagraphStyle(
        "AgroGuardNormal",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#374151")
    )

    small_style = ParagraphStyle(
        "AgroGuardSmall",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=7.5,
        leading=9.5,
        textColor=colors.HexColor("#374151")
    )

    tiny_style = ParagraphStyle(
        "AgroGuardTiny",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=6.5,
        leading=8,
        textColor=colors.HexColor("#374151")
    )

    white_small_style = ParagraphStyle(
        "AgroGuardWhiteSmall",
        parent=small_style,
        textColor=colors.white
    )

    # ========================================================
    # PDF DOCUMENT
    # ========================================================

    document = SimpleDocTemplate(
        str(output_file),
        pagesize=A4,
        rightMargin=36,
        leftMargin=36,
        topMargin=48,
        bottomMargin=48
    )

    story = []

    # ========================================================
    # COVER / TITLE
    # ========================================================

    story.append(
        Spacer(
            1,
            10
        )
    )

    story.append(
        Paragraph(
            "AGROGUARD AI",
            title_style
        )
    )

    story.append(
        Paragraph(
            "Mission Analysis & Agricultural Pest Intelligence Report",
            subtitle_style
        )
    )

    # Mission status banner

    status_table = Table(
        [
            [
                Paragraph(
                    "<b>MISSION</b>",
                    small_style
                ),
                Paragraph(
                    f"<b>#{mission_id}</b>",
                    small_style
                ),
                Paragraph(
                    "<b>STATUS</b>",
                    small_style
                ),
                Paragraph(
                    f"<b>{_safe_text(status).upper()}</b>",
                    small_style
                )
            ]
        ],
        colWidths=[
            70,
            90,
            70,
            280
        ]
    )

    status_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, -1),
                    colors.HexColor("#F1F5EF")
                ),
                (
                    "BOX",
                    (0, 0),
                    (-1, -1),
                    0.8,
                    colors.HexColor("#C9DCC1")
                ),
                (
                    "INNERGRID",
                    (0, 0),
                    (-1, -1),
                    0.4,
                    colors.HexColor("#DCE6D8")
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(
        status_table
    )

    story.append(
        Spacer(
            1,
            12
        )
    )

    # ========================================================
    # MISSION OVERVIEW
    # ========================================================

    story.append(
        Paragraph(
            "Mission Overview",
            heading_style
        )
    )

    mission_rows = [
        [
            Paragraph(
                "<b>Mission ID</b>",
                small_style
            ),
            Paragraph(
                str(mission_id),
                small_style
            )
        ],
        [
            Paragraph(
                "<b>Mission Name</b>",
                small_style
            ),
            Paragraph(
                _safe_text(mission_name),
                small_style
            )
        ],
        [
            Paragraph(
                "<b>Processing Status</b>",
                small_style
            ),
            Paragraph(
                _safe_text(status),
                small_style
            )
        ],
        [
            Paragraph(
                "<b>Frames Analysed</b>",
                small_style
            ),
            Paragraph(
                str(total_frames),
                small_style
            )
        ],
        [
            Paragraph(
                "<b>Total Pest Detections</b>",
                small_style
            ),
            Paragraph(
                str(total_detections),
                small_style
            )
        ],
        [
            Paragraph(
                "<b>Average Detection Confidence</b>",
                small_style
            ),
            Paragraph(
                f"{average_confidence:.3f}",
                small_style
            )
        ],
        [
            Paragraph(
                "<b>Overall Risk Level</b>",
                small_style
            ),
            Paragraph(
                report_severity,
                small_style
            )
        ]
    ]

    mission_table = Table(
        mission_rows,
        colWidths=[
            175,
            335
        ]
    )

    mission_table.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#D7DED4")
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#F1F5EF")
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )
            ]
        )
    )

    story.append(
        mission_table
    )

    # ========================================================
    # DETECTED PESTS
    # ========================================================

    story.append(
        Paragraph(
            "Detected Pest Profile",
            heading_style
        )
    )

    if pest_counts:

        pest_rows = [
            [
                Paragraph(
                    "<b>Pest / Class</b>",
                    small_style
                ),
                Paragraph(
                    "<b>Detections</b>",
                    small_style
                ),
                Paragraph(
                    "<b>Average Confidence</b>",
                    small_style
                )
            ]
        ]

        for pest_name in sorted(
            pest_counts.keys(),
            key=lambda name: str(name).lower()
        ):

            confidences = pest_confidences.get(
                pest_name,
                []
            )

            if confidences:

                pest_average = (
                    sum(confidences)
                    /
                    len(confidences)
                )

            else:

                pest_average = 0.0

            pest_rows.append(
                [
                    Paragraph(
                        str(pest_name),
                        small_style
                    ),
                    Paragraph(
                        str(
                            pest_counts[
                                pest_name
                            ]
                        ),
                        small_style
                    ),
                    Paragraph(
                        f"{pest_average:.3f}",
                        small_style
                    )
                ]
            )

        pest_table = Table(
            pest_rows,
            colWidths=[
                245,
                110,
                155
            ],
            repeatRows=1
        )

        pest_table.setStyle(
            TableStyle(
                [
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#D7DED4")
                    ),
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#EAF2E6")
                    ),
                    (
                        "FONTNAME",
                        (0, 0),
                        (-1, 0),
                        "Helvetica-Bold"
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE"
                    ),
                    (
                        "ALIGN",
                        (1, 1),
                        (-1, -1),
                        "CENTER"
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        6
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        6
                    )
                ]
            )
        )

        story.append(
            pest_table
        )

    else:

        story.append(
            Paragraph(
                "No pest detections were recorded in the analysed frames.",
                normal_style
            )
        )

    # ========================================================
    # SPRAY ADVISORY
    # ========================================================

    story.append(
        Spacer(
            1,
            10
        )
    )

    story.append(
        Paragraph(
            "Agricultural Spray Advisory",
            heading_style
        )
    )

    story.append(
        Paragraph(
            (
                "The following advisory is generated from the "
                "configured agricultural advisory dataset and "
                "the pests detected during this mission."
            ),
            normal_style
        )
    )

    story.append(
        Spacer(
            1,
            8
        )
    )

    if pest_counts:

        for pest_name in sorted(
            pest_counts.keys(),
            key=lambda name: str(name).lower()
        ):

            confidences = pest_confidences.get(
                pest_name,
                []
            )

            if confidences:

                pest_confidence = (
                    sum(confidences)
                    /
                    len(confidences)
                )

            else:

                pest_confidence = 0.0

            # Use the EXISTING advisory service.
            # No pesticide information is invented here.

            advisory = generate_spray_advisory(
                pest=str(
                    pest_name
                ),
                confidence=pest_confidence,
                severity=report_severity
            )

            if not isinstance(
                advisory,
                dict
            ):

                advisory = {}

            recommendation = (
                advisory.get(
                    "recommendation_class"
                )
                or advisory.get(
                    "action"
                )
                or advisory.get(
                    "intervention"
                )
                or "Follow validated agricultural guidance."
            )

            monitoring = (
                advisory.get(
                    "monitoring"
                )
                or
                "Inspect affected plants and nearby plants "
                "for continued pest activity."
            )

            intervention = (
                advisory.get(
                    "intervention"
                )
                or
                "Consult qualified agricultural extension "
                "guidance before selecting a pesticide."
            )

            active_ingredient = (
                advisory.get(
                    "active_ingredient"
                )
                or
                "Not available in advisory dataset"
            )

            formulation = (
                advisory.get(
                    "formulation"
                )
                or
                "Not available in advisory dataset"
            )

            dose = (
                advisory.get(
                    "dose"
                )
                or
                "Not available in advisory dataset"
            )

            application_method = (
                advisory.get(
                    "application_method"
                )
                or
                "Not available in advisory dataset"
            )

            source = (
                advisory.get(
                    "source"
                )
                or
                "Configured agricultural advisory dataset"
            )

            advisory_status = (
                advisory.get(
                    "advisory_status"
                )
                or
                "Advisory status unavailable"
            )

            # ------------------------------------------------
            # Pest advisory card
            # ------------------------------------------------

            story.append(
                Paragraph(
                    str(pest_name),
                    section_label_style
                )
            )

            summary_table = Table(
                [
                    [
                        Paragraph(
                            "<b>Severity</b>",
                            small_style
                        ),
                        Paragraph(
                            str(report_severity),
                            small_style
                        ),
                        Paragraph(
                            "<b>Confidence</b>",
                            small_style
                        ),
                        Paragraph(
                            f"{pest_confidence:.3f}",
                            small_style
                        )
                    ],
                    [
                        Paragraph(
                            "<b>Status</b>",
                            small_style
                        ),
                        Paragraph(
                            str(advisory_status),
                            small_style
                        ),
                        Paragraph(
                            "<b>Detections</b>",
                            small_style
                        ),
                        Paragraph(
                            str(
                                pest_counts[
                                    pest_name
                                ]
                            ),
                            small_style
                        )
                    ]
                ],
                colWidths=[
                    70,
                    185,
                    75,
                    155
                ]
            )

            severity_background, severity_foreground = (
                _risk_colors(
                    report_severity
                )
            )

            summary_table.setStyle(
                TableStyle(
                    [
                        (
                            "GRID",
                            (0, 0),
                            (-1, -1),
                            0.5,
                            colors.HexColor("#D7DED4")
                        ),
                        (
                            "BACKGROUND",
                            (0, 0),
                            (0, -1),
                            colors.HexColor("#F1F5EF")
                        ),
                        (
                            "BACKGROUND",
                            (2, 0),
                            (2, -1),
                            colors.HexColor("#F1F5EF")
                        ),
                        (
                            "BACKGROUND",
                            (1, 0),
                            (1, 0),
                            severity_background
                        ),
                        (
                            "TEXTCOLOR",
                            (1, 0),
                            (1, 0),
                            severity_foreground
                        ),
                        (
                            "VALIGN",
                            (0, 0),
                            (-1, -1),
                            "MIDDLE"
                        ),
                        (
                            "TOPPADDING",
                            (0, 0),
                            (-1, -1),
                            6
                        ),
                        (
                            "BOTTOMPADDING",
                            (0, 0),
                            (-1, -1),
                            6
                        )
                    ]
                )
            )

            story.append(
                summary_table
            )

            story.append(
                Spacer(
                    1,
                    5
                )
            )

            advisory_rows = [
                [
                    Paragraph(
                        "<b>Recommendation</b>",
                        small_style
                    ),
                    Paragraph(
                        str(recommendation),
                        small_style
                    )
                ],
                [
                    Paragraph(
                        "<b>Monitoring</b>",
                        small_style
                    ),
                    Paragraph(
                        str(monitoring),
                        small_style
                    )
                ],
                [
                    Paragraph(
                        "<b>Active Ingredient</b>",
                        small_style
                    ),
                    Paragraph(
                        str(active_ingredient),
                        small_style
                    )
                ],
                [
                    Paragraph(
                        "<b>Formulation</b>",
                        small_style
                    ),
                    Paragraph(
                        str(formulation),
                        small_style
                    )
                ],
                [
                    Paragraph(
                        "<b>Dose</b>",
                        small_style
                    ),
                    Paragraph(
                        str(dose),
                        small_style
                    )
                ],
                [
                    Paragraph(
                        "<b>Application Method</b>",
                        small_style
                    ),
                    Paragraph(
                        str(application_method),
                        small_style
                    )
                ],
                [
                    Paragraph(
                        "<b>Intervention</b>",
                        small_style
                    ),
                    Paragraph(
                        str(intervention),
                        small_style
                    )
                ],
                [
                    Paragraph(
                        "<b>Source</b>",
                        small_style
                    ),
                    Paragraph(
                        str(source),
                        small_style
                    )
                ]
            ]

            advisory_table = Table(
                advisory_rows,
                colWidths=[
                    125,
                    385
                ]
            )

            advisory_table.setStyle(
                TableStyle(
                    [
                        (
                            "GRID",
                            (0, 0),
                            (-1, -1),
                            0.5,
                            colors.HexColor("#D7DED4")
                        ),
                        (
                            "BACKGROUND",
                            (0, 0),
                            (0, -1),
                            colors.HexColor("#F1F5EF")
                        ),
                        (
                            "VALIGN",
                            (0, 0),
                            (-1, -1),
                            "TOP"
                        ),
                        (
                            "TOPPADDING",
                            (0, 0),
                            (-1, -1),
                            6
                        ),
                        (
                            "BOTTOMPADDING",
                            (0, 0),
                            (-1, -1),
                            6
                        )
                    ]
                )
            )

            story.append(
                advisory_table
            )

            story.append(
                Spacer(
                    1,
                    10
                )
            )

    else:

        story.append(
            Paragraph(
                "No pest detected. Spray intervention is not recommended.",
                normal_style
            )
        )

    # ========================================================
    # PAGE BREAK BEFORE SPATIAL ANALYSIS
    # ========================================================

    story.append(
        PageBreak()
    )

    # ========================================================
    # SPATIAL RISK ZONE ANALYSIS
    # ========================================================

    story.append(
        Paragraph(
            "Spatial Pest Risk Analysis",
            heading_style
        )
    )

    story.append(
        Paragraph(
            (
                "The mission detections are summarized using the "
                "configured 3 × 3 image-based demonstration grid."
            ),
            normal_style
        )
    )

    story.append(
        Spacer(
            1,
            8
        )
    )

    # Risk summary

    risk_summary = Table(
        [
            [
                Paragraph(
                    "<b>HIGH RISK</b>",
                    small_style
                ),
                Paragraph(
                    "<b>MODERATE RISK</b>",
                    small_style
                ),
                Paragraph(
                    "<b>LOW RISK</b>",
                    small_style
                )
            ],
            [
                Paragraph(
                    str(len(high_zones)),
                    small_style
                ),
                Paragraph(
                    str(len(moderate_zones)),
                    small_style
                ),
                Paragraph(
                    str(len(low_zones)),
                    small_style
                )
            ]
        ],
        colWidths=[
            170,
            170,
            170
        ]
    )

    risk_summary.setStyle(
        TableStyle(
            [
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#D7DED4")
                ),
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, 0),
                    colors.HexColor("#FEE2E2")
                ),
                (
                    "BACKGROUND",
                    (1, 0),
                    (1, 0),
                    colors.HexColor("#FEF3C7")
                ),
                (
                    "BACKGROUND",
                    (2, 0),
                    (2, 0),
                    colors.HexColor("#DCFCE7")
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER"
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7
                )
            ]
        )
    )

    story.append(
        risk_summary
    )

    story.append(
        Spacer(
            1,
            12
        )
    )

    # ========================================================
    # 3 x 3 GRID
    # ========================================================

    grid_lookup = {}

    for zone in zones:

        if not isinstance(
            zone,
            dict
        ):
            continue

        try:

            zone_number = int(
                zone.get(
                    "zone"
                )
            )

        except (
            TypeError,
            ValueError
        ):

            continue

        grid_lookup[
            zone_number
        ] = zone

    grid_rows = []

    for zone_number in range(
        1,
        10
    ):

        zone = grid_lookup.get(
            zone_number,
            {}
        )

        risk_level = str(
            zone.get(
                "risk_level",
                "LOW"
            )
        ).upper()

        detections = zone.get(
            "total_detections",
            0
        )

        risk_score = _safe_float(
            zone.get(
                "risk_score",
                0
            )
        )

        background, foreground = (
            _risk_colors(
                risk_level
            )
        )

        cell = Table(
            [
                [
                    Paragraph(
                        f"<b>ZONE {zone_number}</b>",
                        white_small_style
                    )
                ],
                [
                    Paragraph(
                        f"<b>{risk_level}</b>",
                        white_small_style
                    )
                ],
                [
                    Paragraph(
                        f"{detections} detections",
                        white_small_style
                    )
                ],
                [
                    Paragraph(
                        f"Score: {risk_score:.1f}",
                        white_small_style
                    )
                ]
            ],
            colWidths=[
                160
            ],
            rowHeights=[
                24,
                22,
                22,
                22
            ]
        )

        cell.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        background
                    ),
                    (
                        "ALIGN",
                        (0, 0),
                        (-1, -1),
                        "CENTER"
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "MIDDLE"
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.8,
                        colors.white
                    )
                ]
            )
        )

        grid_rows.append(
            cell
        )

    # Arrange 1-3 / 4-6 / 7-9

    grid_table = Table(
        [
            grid_rows[0:3],
            grid_rows[3:6],
            grid_rows[6:9]
        ],
        colWidths=[
            160,
            160,
            160
        ],
        rowHeights=[
            90,
            90,
            90
        ]
    )

    grid_table.setStyle(
        TableStyle(
            [
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),
                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER"
                )
            ]
        )
    )

    story.append(
        grid_table
    )

    story.append(
        Spacer(
            1,
            12
        )
    )

    # ========================================================
    # ZONE DETAIL TABLE
    # ========================================================

    if zones:

        zone_rows = [
            [
                Paragraph(
                    "<b>Zone</b>",
                    tiny_style
                ),
                Paragraph(
                    "<b>Detections</b>",
                    tiny_style
                ),
                Paragraph(
                    "<b>Avg. Confidence</b>",
                    tiny_style
                ),
                Paragraph(
                    "<b>Risk Score</b>",
                    tiny_style
                ),
                Paragraph(
                    "<b>Risk Level</b>",
                    tiny_style
                )
            ]
        ]

        for zone in zones:

            if not isinstance(
                zone,
                dict
            ):
                continue

            zone_number = zone.get(
                "zone",
                "?"
            )

            detections = zone.get(
                "total_detections",
                0
            )

            confidence = _safe_float(
                zone.get(
                    "average_confidence",
                    0
                )
            )

            risk_score = _safe_float(
                zone.get(
                    "risk_score",
                    0
                )
            )

            risk_level = str(
                zone.get(
                    "risk_level",
                    "LOW"
                )
            ).upper()

            zone_rows.append(
                [
                    Paragraph(
                        str(zone_number),
                        tiny_style
                    ),
                    Paragraph(
                        str(detections),
                        tiny_style
                    ),
                    Paragraph(
                        f"{confidence:.3f}",
                        tiny_style
                    ),
                    Paragraph(
                        f"{risk_score:.2f}",
                        tiny_style
                    ),
                    Paragraph(
                        risk_level,
                        tiny_style
                    )
                ]
            )

        zone_table = Table(
            zone_rows,
            colWidths=[
                70,
                90,
                120,
                100,
                130
            ],
            repeatRows=1
        )

        zone_commands = [
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.HexColor("#D7DED4")
            ),
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#EAF2E6")
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold"
            ),
            (
                "ALIGN",
                (0, 0),
                (-1, -1),
                "CENTER"
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                5
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                5
            )
        ]

        for row_index, zone in enumerate(
            zones,
            start=1
        ):

            if not isinstance(
                zone,
                dict
            ):
                continue

            risk_level = str(
                zone.get(
                    "risk_level",
                    "LOW"
                )
            ).upper()

            background, foreground = (
                _risk_colors(
                    risk_level
                )
            )

            zone_commands.extend(
                [
                    (
                        "BACKGROUND",
                        (4, row_index),
                        (4, row_index),
                        background
                    ),
                    (
                        "TEXTCOLOR",
                        (4, row_index),
                        (4, row_index),
                        foreground
                    )
                ]
            )

        zone_table.setStyle(
            TableStyle(
                zone_commands
            )
        )

        story.append(
            zone_table
        )

    # ========================================================
    # ZONE SUMMARY
    # ========================================================

    story.append(
        Spacer(
            1,
            10
        )
    )

    story.append(
        Paragraph(
            "Risk Distribution",
            section_label_style
        )
    )

    story.append(
        Paragraph(
            (
                "High-risk zones: "
                f"{', '.join(map(str, high_zones)) or 'None'}"
                "<br/>"
                "Moderate-risk zones: "
                f"{', '.join(map(str, moderate_zones)) or 'None'}"
                "<br/>"
                "Low-risk zones: "
                f"{', '.join(map(str, low_zones)) or 'None'}"
            ),
            normal_style
        )
    )

    # ========================================================
    # NOTES / DISCLAIMER
    # ========================================================

    story.append(
        Spacer(
            1,
            12
        )
    )

    story.append(
        Paragraph(
            "Interpretation & Notes",
            heading_style
        )
    )

    story.append(
        Paragraph(
            (
                "This report summarizes AgroGuard AI YOLO-based "
                "pest detections and the configured image-based "
                "3 × 3 spatial risk analysis performed on the "
                "uploaded mission video."
            ),
            normal_style
        )
    )

    story.append(
        Spacer(
            1,
            7
        )
    )

    story.append(
        Paragraph(
            (
                "The spatial zoning shown here is a "
                "demonstration-stage image-based risk analysis. "
                "It does not represent actual geographic affected "
                "field area. Real geographic zoning requires "
                "calibrated UAV, GPS and geospatial data."
            ),
            small_style
        )
    )

    story.append(
        Spacer(
            1,
            7
        )
    )

    story.append(
        Paragraph(
            (
                "Spray recommendations are generated only from "
                "the configured agricultural advisory dataset. "
                "Where no validated advisory record exists for "
                "a detected pest, pesticide details are not "
                "invented."
            ),
            small_style
        )
    )

    story.append(
        Spacer(
            1,
            7
        )
    )

    story.append(
        Paragraph(
            (
                "AgroGuard AI provides decision-support "
                "information. Any pesticide or chemical "
                "application must follow applicable agricultural "
                "guidance, local regulations and product-label "
                "instructions."
            ),
            small_style
        )
    )

    # ========================================================
    # BUILD PDF
    # ========================================================

    document.build(
        story,
        onFirstPage=_draw_page,
        onLaterPages=_draw_page
    )

    print(
        f"Mission report saved to: {output_file}"
    )

    return str(
        output_file
    )