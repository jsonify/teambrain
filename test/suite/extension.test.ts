import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  vscode.window.showInformationMessage('Start all tests.');

  test('Extension should be present', () => {
    assert.ok(vscode.extensions.getExtension('teambrain.teambrain'));
  });

  test('Should register teambrain.search command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('teambrain.search'));
  });

  test('Should register teambrain.openDocument command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('teambrain.openDocument'));
  });

  test('Should register teambrain.refresh command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('teambrain.refresh'));
  });

  test('Should register teambrain.addToFavorites command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('teambrain.addToFavorites'));
  });

  test('Should register teambrain.removeFromFavorites command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('teambrain.removeFromFavorites'));
  });

  test('Should register teambrain.copyLink command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('teambrain.copyLink'));
  });

  test('Should register teambrain.signOut command', async () => {
    const commands = await vscode.commands.getCommands(true);
    assert.ok(commands.includes('teambrain.signOut'));
  });
});
