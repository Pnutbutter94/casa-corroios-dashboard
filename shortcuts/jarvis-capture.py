#!/usr/bin/env python3
"""
Jarvis Capture shortcut builder.

Usage:
    python3 shortcuts/jarvis-capture.py

Outputs:
    shortcuts/jarvis-capture.shortcut   (unsigned — for reference)
    shortcuts/jarvis-capture.signed.shortcut  (signed — served to iPhone)

After building, sign with:
    shortcuts sign --mode people-who-know-me \
        --input shortcuts/jarvis-capture.shortcut \
        --output shortcuts/jarvis-capture.signed.shortcut

Then deploy:
    /deploy  (or: scp signed.shortcut casaserver:/opt/casaserver/dashboard/shortcuts/)

Install on iPhone (Safari — both work):
    Home:  http://192.168.1.100:8080/shortcuts/jarvis-capture
    Away:  http://100.100.203.28:8080/shortcuts/jarvis-capture  (Tailscale — always valid)
"""
import plistlib, uuid, os, sys

# Tailscale IP works from anywhere (home + away). LAN IP (192.168.1.100) is faster at home
# but Tailscale is always correct — no need to switch.
CASASERVER_URL = 'http://100.100.203.28:8080'
CAPTURE_URL    = f'{CASASERVER_URL}/api/jarvis/capture'

ICON_COLOR = 1485505279   # Apple Indigo: R=88 G=86 B=214 A=255 (0x5856D6FF)
ICON_GLYPH = 61440        # Shortcuts star — reliable cross-version glyph

TYPES = ['X', 'YT', 'TH', 'IG', 'LINK', 'IMG', 'IDEA', 'OBS', 'TASK', 'DECISION', 'PERSON']


def uid():
    return str(uuid.uuid4()).upper()


def token(template, attachments=None):
    return {
        'Value': {
            'attachmentsByRange': attachments or {},
            'string': template,
        },
        'WFSerializationType': 'WFTextTokenString',
    }


def ref(name, out_uuid):
    return {'OutputName': name, 'OutputUUID': out_uuid, 'Type': 'ActionOutput'}


def build():
    u_list     = uid()
    u_pick     = uid()
    u_text     = uid()
    u_ctx      = uid()
    u_line     = uid()

    actions = [
        {
            'WFWorkflowActionIdentifier': 'is.workflow.actions.list',
            'WFWorkflowActionParameters': {
                'UUID': u_list,
                'WFItems': TYPES,
            },
        },
        {
            'WFWorkflowActionIdentifier': 'is.workflow.actions.choosefromlist',
            'WFWorkflowActionParameters': {
                'UUID': u_pick,
                'WFChooseFromListActionPrompt': 'Tipo de Captura',
                'WFInput': token('￼', {'{0, 1}': ref('List', u_list)}),
            },
        },
        {
            'WFWorkflowActionIdentifier': 'is.workflow.actions.ask',
            'WFWorkflowActionParameters': {
                'UUID': u_text,
                'WFAskActionPrompt': 'Conteúdo (URL ou texto)',
                'WFInputType': 'Text',
                'WFAllowMultipleLines': False,
            },
        },
        {
            'WFWorkflowActionIdentifier': 'is.workflow.actions.ask',
            'WFWorkflowActionParameters': {
                'UUID': u_ctx,
                'WFAskActionPrompt': 'Contexto (opcional)',
                'WFInputType': 'Text',
                'WFAllowMultipleLines': False,
            },
        },
        {
            'WFWorkflowActionIdentifier': 'is.workflow.actions.gettext',
            'WFWorkflowActionParameters': {
                'UUID': u_line,
                'CustomOutputName': 'Linha',
                'WFTextActionText': token(
                    '- [￼] ￼ — ￼',
                    {
                        '{3, 1}':  ref('Selected Item', u_pick),
                        '{6, 1}':  ref('Provided Input', u_text),
                        '{10, 1}': ref('Provided Input', u_ctx),
                    },
                ),
            },
        },
        {
            'WFWorkflowActionIdentifier': 'is.workflow.actions.downloadurl',
            'WFWorkflowActionParameters': {
                'UUID': uid(),
                'WFHTTPMethod': 'POST',
                'WFHTTPBodyType': 'JSON',
                'WFURL': token(CAPTURE_URL),
                'WFJSONValues': {
                    'Value': {
                        'WFDictionaryFieldValueItems': [{
                            'WFItemType': 0,
                            'WFKey': token('line'),
                            'WFValue': token('￼', {'{0, 1}': ref('Linha', u_line)}),
                        }],
                    },
                    'WFSerializationType': 'WFDictionaryFieldValue',
                },
            },
        },
        {
            'WFWorkflowActionIdentifier': 'is.workflow.actions.notification',
            'WFWorkflowActionParameters': {
                'UUID': uid(),
                'WFNotificationActionTitle': 'Jarvis',
                'WFNotificationActionBody': 'Capturado ✓',
                'WFNotificationActionSound': False,
            },
        },
    ]

    return {
        'WFWorkflowActions': actions,
        'WFWorkflowClientVersion': '1343.18',
        'WFWorkflowHasShortcutInputVariables': False,
        'WFWorkflowIcon': {
            'WFWorkflowIconGlyphNumber': ICON_GLYPH,
            'WFWorkflowIconStartColor': ICON_COLOR,
        },
        'WFWorkflowImportQuestions': [],
        'WFWorkflowInputContentItemClasses': [],
        'WFWorkflowMinimumClientVersion': '900',
        'WFWorkflowMinimumClientVersionString': '900',
        'WFWorkflowName': 'Jarvis Capture',
        'WFWorkflowOutputContentItemClasses': [],
        'WFWorkflowTypes': [],
        'WFQuickActionSurfaces': [],
    }


if __name__ == '__main__':
    out_dir = os.path.dirname(__file__)
    out_path = os.path.join(out_dir, 'jarvis-capture.shortcut')

    pl = build()
    with open(out_path, 'wb') as f:
        plistlib.dump(pl, f, fmt=plistlib.FMT_BINARY)

    size = os.path.getsize(out_path)
    print(f'Built: {out_path} ({size} bytes)')
    print(f'Sign:  shortcuts sign --mode people-who-know-me --input {out_path} --output {out_path.replace(".shortcut", ".signed.shortcut")}')
